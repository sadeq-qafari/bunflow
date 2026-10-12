import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const executable = resolve(import.meta.dir, "../dist/flow");
const directory = mkdtempSync(join(tmpdir(), "flow-executable-smoke-"));
const port = 15000 + Math.floor(Math.random() * 10000),
  base = `http://127.0.0.1:${port}`;
async function start() {
  const child = spawn(
    executable,
    ["--port", String(port), "--data-dir", directory],
    {
      cwd: tmpdir(),
      env: { ...process.env, FLOW_ADMIN_PASSWORD: "temporary-smoke-password" },
      stdio: ["ignore", "pipe", "inherit"],
    }
  );
  await new Promise<void>((resolve, reject) => {
    child.stdout.on("data", (data) => {
      if (data.toString().includes("Flow:")) resolve();
    });
    child.once("exit", (code) =>
      reject(new Error("Executable exited: " + code))
    );
  });
  return child;
}
async function stop(child: ReturnType<typeof spawn>) {
  const exited = new Promise<void>((resolve) =>
    child.once("exit", () => resolve())
  );
  child.kill("SIGTERM");
  await exited;
}
let child: ReturnType<typeof spawn> | undefined;
let token = "";
async function api(path: string, body?: any) {
  const response = await fetch(base + "/api" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.equal(response.status, 200);
  return ((await response.json()) as any).result;
}
async function login() {
  token = (
    await api("/identity/account/token", {
      username: "admin",
      password: "temporary-smoke-password",
      type: 1,
    })
  ).accessToken;
}
try {
  child = await start();
  await login();
  assert.match(await (await fetch(base + "/flow")).text(), /<html/);
  const id = await api("/flow/form/upsert", {
    name: "Contacts",
    title: "Contacts",
    isActive: true,
    isAddable: true,
    isUpdatable: true,
    isDeletable: true,
    layout: '[{"i":0,"x":0,"y":0,"w":3,"h":1}]',
    items: [
      {
        layoutIndex: 0,
        name: "name",
        title: "نام",
        type: "string",
        elementId: 1,
        isRequired: true,
        isAddable: true,
        isUpdatable: true,
      },
    ],
    actionItems: [],
  });
  await api("/flow/form/submit/Contacts", { data: { name: "Sadegh" } });
  assert.equal((await api("/flow/form/Contacts")).totalCount, 1);
  const excel = await fetch(base + "/api/flow/form/excel/Contacts", {
    headers: { authorization: "Bearer " + token },
  });
  assert.equal(excel.status, 200);
  const bytes = new Uint8Array(await excel.arrayBuffer());
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  const data = new FormData();
  data.set("formData", new File([bytes], "contacts.xlsx"));
  data.set("formName", "Contacts");
  const previewResponse = await fetch(base + "/api/flow/form/importExcel", {
    method: "POST",
    headers: { authorization: "Bearer " + token },
    body: data,
  });
  assert.equal(previewResponse.status, 200);
  const preview = ((await previewResponse.json()) as any).result;
  await api("/flow/form/batchInsert", {
    formId: id,
    reference: preview.reference,
    selectedItems: { [id]: preview.forms.Contacts.map((r: any) => r.Id) },
  });
  assert.equal((await api("/flow/form/Contacts")).totalCount, 2);
  await stop(child);
  child = await start();
  await login();
  assert.equal((await api("/flow/form/Contacts")).items[0].Name, "Sadegh");
  assert.equal((await api("/flow/form/Contacts")).totalCount, 2);
  console.log(
    "PASS standalone executable: embedded Vue, login, forms/records, Excel export/import, and persistence across restart."
  );
} finally {
  if (child && child.exitCode === null) await stop(child);
  rmSync(directory, { recursive: true, force: true });
}
