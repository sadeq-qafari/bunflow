import type { Database } from "bun:sqlite";
import { ApiError, fail, safeJson, setting } from "./db";
import { Catalog } from "./catalog";
import { Records, text } from "./records";
import { Auth } from "./auth";
import { Transfer } from "./transfer";
import { elements } from "./elements";
import { services, menus } from "./metadata";
import { randomUUID } from "node:crypto";

const success = (result: any) =>
  Response.json({ success: true, error: null, result });
const download = (bytes: Uint8Array, type: string, name: string) =>
  new Response(bytes as any, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
export function createApp(
  db: Database,
  assets: Record<string, { content: string; type: string }> = {}
) {
  const catalog = new Catalog(db),
    records = new Records(db, catalog),
    auth = new Auth(db),
    transfer = new Transfer(catalog, records);
  async function handle(request: Request, client = "local"): Promise<Response> {
    try {
      const url = new URL(request.url);
      const original = url.pathname;
      if (original === "/health" && request.method === "GET")
        return success({ status: "ok", version: "1.0.0" });
      if (!original.startsWith("/api/")) {
        if (request.method !== "GET" && request.method !== "HEAD")
          return fail(405, "method_not_allowed");
        const asset =
          assets[original] ||
          (!/\.[^/]+$/.test(original) ? assets["/index.html"] : null);
        if (!asset) return fail(404, "not_found");
        return new Response(
          request.method === "HEAD"
            ? null
            : Buffer.from(asset.content, "base64"),
          {
            headers: {
              "Content-Type": asset.type,
              "X-Content-Type-Options": "nosniff",
              "Cache-Control":
                original.includes("/js/") || original.includes("/css/")
                  ? "public, max-age=31536000, immutable"
                  : "no-cache",
            },
          }
        );
      }
      const path = original.slice(4).toLowerCase().replace(/\/$/, "");
      const q = new URLSearchParams();
      url.searchParams.forEach((v, k) => q.append(k.toLowerCase(), v));
      const method = request.method;
      const json = async () => {
        try {
          return await request.json();
        } catch {
          return fail(400, "invalid_json");
        }
      };
      // Public endpoints are limited to login and health. Everything containing user data requires a session.
      if (path === "/identity/account/token" && method === "POST")
        return success(await auth.login(await json(), client));
      if (path === "/identity/tenant/gettenantinfowithurl" && method === "POST")
        return success({ title: "Flow", officialTitle: "Flow", logo: null });
      const user = auth.user(request);
      if (method === "GET" && path === "/identity/user/info")
        return success(auth.info(user));
      if (method === "GET" && path === "/identity/user/my/permissions")
        return success(auth.info(user).permissions);
      if (method === "GET" && path === "/identity/tenantuser/tenants")
        return success(auth.tenants(user));
      if (method === "POST" && path === "/identity/account/changepassword")
        return success(await auth.changePassword(user, await json()));
      if (method === "GET" && path === "/tenant/organization/info")
        return success({
          id: 1,
          name: "flow",
          title: "Flow",
          officialTitle: "Flow",
          logo: null,
        });
      if (method === "GET" && path === "/core/version/check")
        return success(false);
      if (method === "GET" && path === "/core/service/services")
        return success({
          version: Math.floor(
            Number(setting(db, "version") || Date.now()) / 1000
          ),
          services,
        });
      if (method === "GET" && path === "/core/menu/user") return success(menus);
      if (method === "POST" && path === "/notify/message/send")
        return fail(501, "external_notifications_not_configured");
      if (method === "GET" && path === "/flow/element/list")
        return success(elements);
      if (method === "GET" && path === "/flow/form/config")
        return success({
          version: Number(setting(db, "version") || 0),
          forms: catalog.forms(),
        });
      if (method === "GET" && path === "/flow/form/info")
        return success(catalog.info(Number(q.get("formid"))));
      if (method === "POST" && path === "/flow/form/upsert")
        return success(catalog.upsert(await json()));
      if (method === "POST" && path === "/flow/lookup/upsert")
        return success(catalog.upsertLookup(await json()));
      if (method === "GET" && path === "/flow/form/search") {
        const result: any = {},
          search = q.get("searchvalue");
        if (search)
          for (const f of catalog.forms()) {
            const params = new URLSearchParams({ filter: search, take: "50" });
            const rows = records.list(f, params).items;
            if (rows.length) result[f.name] = rows;
          }
        return success(result);
      }
      if (method === "GET" && path === "/flow/menu/list")
        return success(
          catalog
            .forms()
            .map((f) => ({
              id: f.id,
              title: f.title,
              icon: "table_chart",
              color: "primary",
              link: "/flow/" + f.name,
              path: "/flow/" + f.name,
              children: [],
            }))
        );
      if (
        method === "GET" &&
        [
          "/flow/form/dropdown",
          "/flow/formproperty/dropdown",
          "/flow/lookup/dropdown",
        ].includes(path)
      ) {
        let list = path.includes("formproperty")
          ? catalog.forms().flatMap((f) => f.properties)
          : path.includes("lookup")
          ? catalog.lookups()
          : catalog.forms();
        const filters = safeJson(q.get("filters"), []);
        if (filters && !Array.isArray(filters) && filters.formId)
          list = list.filter((x: any) => x.formId === Number(filters.formId));
        if (Array.isArray(filters))
          for (const filter of filters) {
            const field = Array.isArray(filter)
              ? filter[0]
              : filter.fieldName || filter.name;
            const value = Array.isArray(filter) ? filter[2] : filter.value;
            if (String(field).toLowerCase() === "formid")
              list = list.filter((x: any) =>
                (Array.isArray(value) ? value : [value])
                  .map(Number)
                  .includes(Number(x.formId))
              );
          }
        const ids = (q.get("ids") || "").split(",").map(Number);
        const search = q.get("searchvalue") || "";
        return success(
          list
            .filter(
              (x: any) =>
                (!ids.some((x) => x > 0) || ids.includes(x.id)) &&
                (!search ||
                  x.title.includes(search) ||
                  x.name?.includes(search))
            )
            .map((x: any) => ({
              value: x.id,
              label: { title: x.title, name: x.name, formId: x.formId },
            }))
        );
      }
      if (method === "GET" && ["/flow/form", "/flow/lookup"].includes(path)) {
        let items = path.endsWith("lookup")
          ? catalog.lookups()
          : catalog.forms();
        const filter = q.get("filter");
        let conditions = safeJson(filter, []);
        if (Array.isArray(conditions))
          for (const c of conditions)
            if (Array.isArray(c))
              items = items.filter((x) => {
                const value = x[c[0]];
                const wanted = Array.isArray(c[2]) ? c[2] : [c[2]];
                return c[1] === "="
                  ? wanted.some((v: any) => String(v) === String(value))
                  : wanted.some((v: any) => text(value).includes(text(v)));
              });
        const sort = (q.get("sort") || "id DESC").match(
          /^(.*?)(?:[ _](ASC|DESC))?$/i
        )!;
        const allowed = path.endsWith("lookup")
          ? ["id", "title", "description", "typeLookup"]
          : ["id", "name", "title", "description", "isActive"];
        if (!allowed.includes(sort[1])) return fail(400, "invalid_sort");
        items.sort((a, b) => {
          const av = a[sort[1]],
            bv = b[sort[1]];
          const c =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : text(av).localeCompare(text(bv));
          return sort[2]?.toUpperCase() === "DESC" ? -c : c;
        });
        const page = Math.max(1, Number(q.get("page")) || 1),
          take = Math.min(500, Math.max(1, Number(q.get("take")) || 10));
        return success({
          items: items.slice((page - 1) * take, page * take),
          totalCount: items.length,
          pageNo: page,
          pageSize: take,
        });
      }
      let match = path.match(/^\/flow\/(form|lookup)\/(\d+)$/);
      if (match) {
        const id = Number(match[2]);
        if (method === "GET")
          return success(
            match[1] === "form" ? catalog.info(id) : catalog.lookup(id)
          );
        if (method === "DELETE") {
          if (match[1] === "form") return success(catalog.remove(id));
          catalog.lookup(id);
          if (
            catalog
              .forms()
              .some((f) =>
                f.properties.some((p: any) => Number(p.lookupId) === id)
              )
          )
            return fail(409, "lookup_is_referenced");
          db.query("DELETE FROM lookups WHERE id=?").run(id);
          return success(true);
        }
      }
      match = path.match(
        /^\/flow\/form\/(read|submit|excel|dropdown|multidropdown)\/([^/]+)$/
      );
      if (match) {
        const form = catalog.form(decodeURIComponent(match[2]));
        if (method === "GET" && match[1] === "read")
          return success(records.read(form, Number(q.get("id"))));
        if (method === "POST" && match[1] === "submit")
          return success(records.submit(form, await json()));
        if (method === "GET" && match[1] === "excel")
          return download(
            await transfer.excel(form, q),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            form.name + ".xlsx"
          );
        if (
          method === "GET" &&
          ["dropdown", "multidropdown"].includes(match[1])
        )
          return success(records.dropdown(form, q));
      }
      if (
        method === "POST" &&
        ["/flow/form/importexcel", "/flow/form/import"].includes(path)
      ) {
        const data = await request.formData();
        const file = data.get("formData");
        if (!(file instanceof File)) return fail(400, "file_required");
        const form = catalog.form(String(data.get("formName") || ""));
        const preview = await transfer.stage(form, file, user.id);
        if (path.endsWith("import")) {
          const selectedItems: any = {};
          for (const [name, rows] of Object.entries(preview.forms))
            selectedItems[catalog.form(name).id] = (rows as any[]).map(
              (r) => r.Id
            );
          return success(
            transfer.batch(
              { formId: form.id, reference: preview.reference, selectedItems },
              user.id
            )
          );
        }
        return success(preview);
      }
      if (method === "POST" && path === "/flow/form/batchinsert")
        return success(transfer.batch(await json(), user.id));
      match = path.match(/^\/flow\/formlead\/(\d+)$/);
      if (method === "DELETE" && match)
        return success(records.remove(Number(match[1])));
      if (method === "GET" && path === "/flow/schema/export")
        return download(
          Buffer.from(
            JSON.stringify(
              transfer.bundle(q.get("includedata") === "true"),
              null,
              2
            )
          ),
          "application/json",
          "flow-export.json"
        );
      if (method === "POST" && path === "/flow/schema/import")
        return success(transfer.importBundle(await json()));
      if (method === "POST" && path === "/cdn/upload/file") {
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return fail(400, "file_required");
        if (file.size > 20 * 1024 * 1024) return fail(413, "file_too_large");
        const id = randomUUID();
        db.query("INSERT INTO files VALUES(?,?,?,?)").run(
          id,
          file.name,
          file.type || "application/octet-stream",
          new Uint8Array(await file.arrayBuffer())
        );
        return success({ fileName: id, originalName: file.name });
      }
      match = path.match(/^\/cdn\/download\/([a-f0-9-]+)$/);
      if (method === "GET" && match) {
        const file = db
          .query("SELECT * FROM files WHERE id=?")
          .get(match[1]) as any;
        if (!file) return fail(404, "file_not_found");
        return download(file.content, "application/octet-stream", "download");
      }
      // All fixed routes precede this generic form-grid route.
      match = path.match(/^\/flow\/form\/([^/]+)$/);
      if (method === "GET" && match)
        return success(
          records.list(catalog.form(decodeURIComponent(match[1])), q)
        );
      return fail(501, "endpoint_not_supported_by_standalone");
    } catch (error) {
      if (error instanceof ApiError)
        return Response.json(
          {
            success: false,
            result: null,
            error: { details: error.details, message: error.message },
          },
          { status: error.status }
        );
      console.error(error);
      return Response.json(
        {
          success: false,
          result: null,
          error: {
            details: "internal_error",
            message: "Internal server error",
          },
        },
        { status: 500 }
      );
    }
  }
  return { handle, auth, catalog, records, transfer };
}
