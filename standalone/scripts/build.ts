import {
  readdirSync,
  readFileSync,
  mkdirSync,
  existsSync,
  writeFileSync,
} from "node:fs";
import { resolve, join, relative, extname } from "node:path";

const root = resolve(import.meta.dir, "..");
const panel = resolve(root, "../panel");
const args = process.argv.slice(2);
if (!args.includes("--skip-panel")) {
  const processHandle = Bun.spawn(
    ["node", join(panel, "node_modules/@quasar/app/bin/quasar"), "build"],
    {
      cwd: panel,
      env: {
        ...process.env,
        FLOW_STANDALONE: "1",
        NODE_OPTIONS: [process.env.NODE_OPTIONS, "--openssl-legacy-provider"]
          .filter(Boolean)
          .join(" "),
      },
      stdout: "inherit",
      stderr: "inherit",
    }
  );
  if ((await processHandle.exited) !== 0) throw Error("Panel build failed");
}
const directory = join(panel, "dist/spa");
if (!existsSync(join(directory, "index.html")))
  throw Error("Build the panel first");
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};
const assets: Record<string, { content: string; type: string }> = {};
function walk(dir: string) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) walk(path);
    else if (!path.endsWith(".map"))
      assets["/" + relative(directory, path).replaceAll("\\", "/")] = {
        content: readFileSync(path).toString("base64"),
        type: types[extname(path)] || "application/octet-stream",
      };
  }
}
walk(directory);
const generated = join(root, "src/assets.generated.ts");
writeFileSync(
  generated,
  "export const assets=" + JSON.stringify(assets) + ";\n"
);
const entry = join(root, "src/main.generated.ts");
writeFileSync(
  entry,
  readFileSync(join(root, "src/main.ts"), "utf8").replace(
    /from ["']\.\/assets["']/,
    'from "./assets.generated"'
  )
);
mkdirSync(join(root, "dist"), { recursive: true });
const targetArg = args.find((x) => x.startsWith("--target="));
const result = await Bun.build({
  entrypoints: [entry],
  compile: {
    ...(targetArg ? { target: targetArg.slice(9) as any } : {}),
    outfile: join(
      root,
      "dist",
      targetArg?.includes("windows") ? "flow.exe" : "flow"
    ),
  },
  minify: true,
});
if (!result.success)
  throw new AggregateError(result.logs, "Compilation failed");
console.log(
  "Built standalone executable with " +
    Object.keys(assets).length +
    " embedded Vue assets."
);
