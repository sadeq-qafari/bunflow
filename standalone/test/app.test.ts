import { test, expect, beforeEach, afterEach } from "bun:test";
import { openDatabase } from "../src/db";
import { createApp } from "../src/app";
import ExcelJS from "exceljs";

let app: ReturnType<typeof createApp>;
let token: string;
beforeEach(async () => {
  app = createApp(openDatabase(":memory:"), {
    "/index.html": {
      content: Buffer.from("<html>Flow</html>").toString("base64"),
      type: "text/html",
    },
  });
  await app.auth.initialize("test-password-only");
  const login = await api(
    "/identity/account/token",
    "POST",
    { username: "admin", password: "test-password-only", type: 1 },
    false
  );
  token = login.data.result.accessToken;
});
afterEach(() => app.catalog.db.close());
async function api(
  path: string,
  method = "GET",
  body?: any,
  authenticated = true
) {
  const response = await app.handle(
    new Request("http://localhost/api" + path, {
      method,
      headers: {
        ...(authenticated ? { authorization: "Bearer " + token } : {}),
        ...(body && !(body instanceof FormData)
          ? { "content-type": "application/json" }
          : {}),
      },
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    })
  );
  const data = (await response.json()) as any;
  return { status: response.status, data };
}
function definition(
  name = "people",
  items: any[] = [
    {
      name: "name",
      title: "نام",
      type: "string",
      elementId: 1,
      isRequired: true,
      isUnique: true,
      isVisibleInDropdown: true,
    },
  ]
) {
  return {
    name,
    title: name,
    isAddable: true,
    isUpdatable: true,
    isDeletable: true,
    isActive: true,
    layout: JSON.stringify(
      items.map((p, i) => ({ i, x: 0, y: i, w: 3, h: 1 }))
    ),
    items: items.map((p, i) => ({
      layoutIndex: i,
      isAddable: true,
      isUpdatable: true,
      isActive: true,
      ...p,
    })),
    actionItems: [],
  };
}
async function form(name = "people", items?: any[]) {
  const r = await api("/flow/form/upsert", "POST", definition(name, items));
  expect(r.status).toBe(200);
  return r.data.result as number;
}
async function submit(name: string, data: any, id = 0) {
  return api("/flow/form/submit/" + name, "POST", {
    id,
    data,
    checkForDuplicate: false,
  });
}

test("auth protects data, checks passwords, and rotates refresh tokens", async () => {
  expect((await api("/flow/form/config", "GET", undefined, false)).status).toBe(
    401
  );
  expect(
    (
      await api(
        "/identity/account/token",
        "POST",
        { username: "admin", password: "wrong", type: 1 },
        false
      )
    ).status
  ).toBe(401);
  const login = await api(
    "/identity/account/token",
    "POST",
    { username: "admin", password: "test-password-only", type: 1 },
    false
  );
  const refresh = login.data.result.refreshToken;
  expect(
    (
      await api(
        "/identity/account/token",
        "POST",
        { type: 3, refreshToken: refresh },
        false
      )
    ).status
  ).toBe(200);
  expect(
    (
      await api(
        "/identity/account/token",
        "POST",
        { type: 3, refreshToken: refresh },
        false
      )
    ).status
  ).toBe(401);
});
test("Vue bootstrap endpoints and static history fallback", async () => {
  expect(
    (await api("/core/service/services")).data.result.version
  ).toBeLessThan(100_000_000_000);
  expect((await api("/flow/form?filter=%255B%255D")).status).toBe(200);
  for (const path of [
    "/identity/user/info",
    "/identity/tenantUser/tenants",
    "/tenant/organization/info",
    "/core/menu/user",
    "/core/service/services",
    "/flow/form/config",
    "/flow/element/list",
    "/core/version/check",
  ]) {
    const r = await api(path);
    expect(r.status).toBe(200);
    expect(r.data.success).toBe(true);
  }
  const r = await app.handle(new Request("http://localhost/flow/people"));
  expect(await r.text()).toContain("Flow");
  expect(
    (await app.handle(new Request("http://localhost/missing.js"))).status
  ).toBe(404);
});
test("form CRUD, stable field rename, sorting, filtering and pagination", async () => {
  const id = await form();
  const first = (await submit("people", { name: "Sadegh" })).data.result.id;
  await submit("people", { name: "Ali" });
  const grid = await api("/flow/form/people?sort=name_ASC&take=1&page=1");
  expect(grid.data.result.totalCount).toBe(2);
  expect(grid.data.result.items[0].Name).toBe("Ali");
  expect(
    (await api("/flow/form/people?filter=Sadegh")).data.result.items
  ).toHaveLength(1);
  const info = (await api("/flow/form/info?formId=" + id)).data.result;
  const p = info.formProperties[0];
  expect(
    (
      await api("/flow/form/upsert", "POST", {
        ...info,
        id,
        items: [{ ...p, name: "fullName" }],
        actionItems: [],
      })
    ).status
  ).toBe(200);
  expect(
    (await api("/flow/form/read/people?id=" + first)).data.result.FullName
  ).toBe("Sadegh");
  expect((await submit("people", { fullName: "Updated" }, first)).status).toBe(
    200
  );
  expect((await api("/flow/formLead/" + first, "DELETE")).data.result).toBe(
    true
  );
  expect((await api("/flow/form/people")).data.result.totalCount).toBe(1);
});
test("required, unique, types, unknown fields and property ownership", async () => {
  const id = await form("numbers", [
    {
      name: "code",
      title: "کد",
      type: "int",
      elementId: 2,
      isRequired: true,
      isUnique: true,
    },
  ]);
  expect((await submit("numbers", {})).status).toBe(400);
  expect((await submit("numbers", { code: "abc" })).status).toBe(400);
  expect((await submit("numbers", { code: 4, extra: "oops" })).status).toBe(
    400
  );
  expect((await submit("numbers", { code: 4 })).status).toBe(200);
  expect((await submit("numbers", { code: 4 })).status).toBe(409);
  expect(
    (
      await api("/flow/form/submit/numbers", "POST", {
        id: 99,
        data: { code: 2 },
      })
    ).status
  ).toBe(404);
  const before = (await api("/flow/form/info?formId=" + id)).data.result;
  const invalid = {
    ...before,
    id,
    items: [{ ...before.properties[0], id: 999 }],
    actionItems: [],
  };
  expect((await api("/flow/form/upsert", "POST", invalid)).status).toBe(400);
  expect(
    (await api("/flow/form/info?formId=" + id)).data.result.properties[0].name
  ).toBe("code");
});
test("relationships, lookups, dropdowns and deletion constraints", async () => {
  const cities = await form("cities", [
    {
      name: "title",
      title: "شهر",
      type: "string",
      elementId: 1,
      isRequired: true,
      isVisibleInDropdown: true,
    },
  ]);
  const city = (await submit("cities", { title: "Mashhad" })).data.result.id;
  const cp = (await api("/flow/form/info?formId=" + cities)).data.result
    .properties[0];
  const lookup = (
    await api("/flow/lookup/upsert", "POST", {
      title: "Status",
      typeLookup: 1,
      items: [{ title: "Active", value: 1 }],
    })
  ).data.result;
  await form("people", [
    { name: "name", title: "نام", type: "string", elementId: 1 },
    {
      name: "city",
      title: "شهر",
      type: "int",
      elementId: 4,
      relatedFormId: cities,
      relatedFormPropertyId: cp.id,
    },
    {
      name: "status",
      title: "وضعیت",
      type: "int",
      elementId: 4,
      lookupId: lookup,
    },
  ]);
  expect(
    (await submit("people", { name: "Sadegh", city: 999, status: 1 })).status
  ).toBe(400);
  const person = (await submit("people", { name: "Sadegh", city, status: 1 }))
    .data.result.id;
  const row = (await api("/flow/form/people")).data.result.items[0];
  expect(row.cityTitle).toBeUndefined();
  expect(row.citiestitle).toBe("Mashhad");
  expect(row.statusTitle).toBe("Active");
  expect(
    (await api("/flow/form/dropdown/cities?Id=" + city)).data.result[0].Title
  ).toBe("Mashhad");
  expect((await api("/flow/formLead/" + city, "DELETE")).status).toBe(409);
  expect((await api("/flow/form/" + cities, "DELETE")).status).toBe(409);
  await api("/flow/formLead/" + person, "DELETE");
  expect((await api("/flow/formLead/" + city, "DELETE")).status).toBe(200);
});
async function excelFile(rows: any[][]) {
  const w = new ExcelJS.Workbook();
  const s = w.addWorksheet("Data");
  for (const row of rows) s.addRow(row);
  return new File(
    [new Uint8Array((await w.xlsx.writeBuffer()) as ArrayBuffer)],
    "test.xlsx"
  );
}
async function preview(name: string, rows: any[][]) {
  const data = new FormData();
  data.set("formData", await excelFile(rows));
  data.set("formName", name);
  return api("/flow/form/importExcel", "POST", data);
}
test("Excel preview and selected insert preserve relationships and import only selected dependencies", async () => {
  const cities = await form("cities", [
    {
      name: "title",
      title: "شهر",
      type: "string",
      elementId: 1,
      isVisibleInDropdown: true,
    },
  ]);
  const prop = (await api("/flow/form/info?formId=" + cities)).data.result
    .properties[0];
  const people = await form("people", [
    {
      name: "name",
      title: "نام",
      type: "string",
      elementId: 1,
      isRequired: true,
    },
    {
      name: "city",
      title: "شهر",
      type: "int",
      elementId: 4,
      relatedFormId: cities,
      relatedFormPropertyId: prop.id,
    },
  ]);
  const staged = await preview("people", [
    ["نام", "شهر"],
    ["Sadegh", "Mashhad"],
    ["Ali", "Tehran"],
  ]);
  expect(staged.status).toBe(200);
  const { reference, forms } = staged.data.result;
  expect(forms.people).toHaveLength(2);
  expect(forms.cities).toHaveLength(2);
  expect(
    (
      await api("/flow/form/batchInsert", "POST", {
        reference,
        formId: people,
        selectedItems: { [people]: [forms.people[0].Id] },
      })
    ).status
  ).toBe(200);
  expect(
    (await api("/flow/form/people")).data.result.items[0].citiestitle
  ).toBe("Mashhad");
  expect((await api("/flow/form/cities")).data.result.totalCount).toBe(1);
  expect(
    (
      await api("/flow/form/batchInsert", "POST", {
        reference,
        formId: people,
        selectedItems: {},
      })
    ).status
  ).toBe(404);
});
test("Excel batch is atomic and rejects stale previews", async () => {
  const id = await form();
  const staged = await preview("people", [["نام"], ["Same"], ["Same"]]);
  const { reference, forms } = staged.data.result;
  expect(
    (
      await api("/flow/form/batchInsert", "POST", {
        reference,
        formId: id,
        selectedItems: { [id]: forms.people.map((r: any) => r.Id) },
      })
    ).status
  ).toBe(409);
  expect((await api("/flow/form/people")).data.result.totalCount).toBe(0);
  const info = (await api("/flow/form/info?formId=" + id)).data.result;
  await api("/flow/form/upsert", "POST", {
    ...info,
    id,
    title: "Changed",
    items: info.properties,
    actionItems: [],
  });
  expect(
    (
      await api("/flow/form/batchInsert", "POST", {
        reference,
        formId: id,
        selectedItems: { [id]: [forms.people[0].Id] },
      })
    ).status
  ).toBe(409);
});
test("Excel export contains readable field titles and values", async () => {
  await form();
  await submit("people", { name: "Sadegh" });
  const response = await app.handle(
    new Request("http://localhost/api/flow/form/excel/people", {
      headers: { authorization: "Bearer " + token },
    })
  );
  expect(response.status).toBe(200);
  const w = new ExcelJS.Workbook();
  await w.xlsx.load(Buffer.from(await response.arrayBuffer()) as any);
  expect(w.worksheets[0].getCell("A1").text).toBe("نام");
  expect(w.worksheets[0].getCell("A2").text).toBe("Sadegh");
});
test("schema and full-data bundles remap form, property and record relationships", async () => {
  const cities = await form("cities", [
    { name: "title", title: "شهر", type: "string", elementId: 1 },
  ]);
  const city = (await submit("cities", { title: "Mashhad" })).data.result.id;
  const cp = (await api("/flow/form/info?formId=" + cities)).data.result
    .properties[0];
  await form("people", [
    { name: "name", title: "نام", type: "string", elementId: 1 },
    {
      name: "city",
      title: "شهر",
      type: "int",
      elementId: 4,
      relatedFormId: cities,
      relatedFormPropertyId: cp.id,
    },
  ]);
  await submit("people", { name: "Sadegh", city });
  const bundle = app.transfer.bundle(true);
  const other = createApp(openDatabase(":memory:"));
  other.catalog.upsert(definition("unrelated"));
  expect(other.transfer.importBundle(bundle)).toEqual({ forms: 2, records: 2 });
  const f = other.catalog.form("people");
  expect(
    other.records.list(f, new URLSearchParams()).items[0].citiestitle
  ).toBe("Mashhad");
  expect(() => other.transfer.importBundle(bundle)).toThrow();
  expect(other.catalog.forms()).toHaveLength(3);
  other.catalog.db.close();
});
test("SQL/server script features fail explicitly and filled fields cannot be silently deleted", async () => {
  const id = await form();
  await submit("people", { name: "Sadegh" });
  expect(
    (
      await api("/flow/form/upsert", "POST", {
        ...definition(),
        id,
        layout: "[]",
        items: [],
      })
    ).status
  ).toBe(409);
  expect(
    (
      await api("/flow/lookup/upsert", "POST", {
        title: "Query",
        typeLookup: 2,
        query: "SELECT 1",
      })
    ).status
  ).toBe(422);
  expect((await api("/core/report/execute", "POST", {})).status).toBe(501);
});
test("schema evolution rejects invalidating existing data", async () => {
  const id = await form();
  await submit("people", { name: "Sadegh" });
  const info = (await api("/flow/form/info?formId=" + id)).data.result;
  expect(
    (
      await api("/flow/form/upsert", "POST", {
        ...info,
        id,
        items: [{ ...info.properties[0], type: "int", elementId: 2 }],
      })
    ).status
  ).toBe(409);
  expect((await api("/flow/form/read/people?id=1")).data.result.Name).toBe(
    "Sadegh"
  );
});
