import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { openDatabase } from "./db";
import { createApp } from "./app";
import { assets } from "./assets";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(
    "Flow standalone\nUsage: flow [--port 5000] [--data-dir PATH] [--host 127.0.0.1]\nFirst launch creates the admin user and prints its initial password.\nFLOW_ADMIN_PASSWORD sets the first-launch password; FLOW_DATA_DIR and FLOW_PORT are also supported."
  );
  process.exit(0);
}
const option = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith("--"))
    throw Error("Missing value for " + name);
  return args[i + 1];
};
const directory = resolve(
  option(
    "--data-dir",
    process.env.FLOW_DATA_DIR || join(homedir(), ".local", "share", "flow")
  )
);
const port = Number(option("--port", process.env.FLOW_PORT || "5000"));
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw Error("Invalid port");
const db = openDatabase(join(directory, "flow.sqlite"));
const app = createApp(db, assets);
const password = await app.auth.initialize(process.env.FLOW_ADMIN_PASSWORD);
if (password)
  console.log(
    "Initial admin password: " +
      password +
      "\nSave it now; it is shown only once."
  );
const server = Bun.serve({
  hostname: option("--host", "127.0.0.1"),
  port,
  maxRequestBodySize: 25 * 1024 * 1024,
  fetch(request, server) {
    return app.handle(request, server.requestIP(request)?.address || "local");
  },
});
console.log(`Flow: ${server.url}\nDatabase: ${join(directory, "flow.sqlite")}`);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    server.stop(true);
    db.close();
    process.exit(0);
  });
