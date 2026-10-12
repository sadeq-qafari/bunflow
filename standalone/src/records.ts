import type { Database } from "bun:sqlite";
import { Catalog } from "./catalog";
import { fail } from "./db";

export const pascal = (s: string) =>
  String(s)
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+(.)(\w*)/g, (_, a, b) => a.toUpperCase() + b.toLowerCase())
    .replace(/\w/, (s) => s.toUpperCase());
export const text = (v: any): string =>
  v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
const equal = (a: any, b: any) => text(a).trim() === text(b).trim();
export class Records {
  constructor(public db: Database, public catalog: Catalog) {}
  raw(id: number): any {
    const row = this.db.query("SELECT * FROM records WHERE id=?").get(id);
    if (!row) return fail(404, "record_not_found");
    return row;
  }
  rows(formId: number): any[] {
    return this.db
      .query("SELECT * FROM records WHERE form_id=? ORDER BY id DESC")
      .all(formId);
  }
  present(row: any, form: any): any {
    const values = JSON.parse(row.data);
    const result: any = {
      Id: row.id,
      id: row.id,
      CreatedAt: row.created_at,
      ModifiedAt: row.modified_at,
      TenantId: 1,
    };
    for (const p of form.properties) {
      const v = values[p.id] ?? null;
      const exposed =
        v == null
          ? null
          : typeof v === "boolean"
          ? v
            ? "True"
            : "False"
          : text(v);
      result[p.name] = exposed;
      result[pascal(p.name)] = exposed;
      if (p.lookup) {
        const title = (p.lookup.options || [])
          .filter((o: any) => text(v).split(",").includes(text(o.value)))
          .map((o: any) => o.title)
          .join(", ");
        result[p.name + "Title"] = title;
        result[pascal(p.name + "Title")] = title;
      }
      if (p.relatedFormId) {
        const related = this.catalog.form(Number(p.relatedFormId));
        const titles = text(v)
          .split(",")
          .map(
            (id) =>
              this.db
                .query("SELECT data FROM records WHERE id=? AND form_id=?")
                .get(Number(id) || 0, related.id) as any
          )
          .filter(Boolean)
          .map((r) => JSON.parse(r.data)[p.relatedFormPropertyId])
          .filter((v) => v != null);
        const key = p.relatedFormName + p.relatedFormPropertyName;
        result[key] = titles.join(", ");
        result[pascal(key)] = titles.join(", ");
      }
    }
    return result;
  }
  validate(form: any, input: any, id = 0): any {
    if (!input || typeof input !== "object" || Array.isArray(input))
      return fail(400, "invalid_record");
    const old = id ? this.raw(id) : null;
    if (old && old.form_id !== form.id) return fail(404, "record_not_found");
    if ((id && !form.isUpdatable) || (!id && !form.isAddable))
      return fail(403, "form_is_read_only");
    const data = old ? JSON.parse(old.data) : {};
    for (const key of Object.keys(input))
      if (
        !form.properties.some(
          (p: any) => p.name === key || pascal(p.name) === key
        )
      )
        return fail(400, "unknown_field:" + key);
    for (const p of form.properties) {
      const provided =
        Object.hasOwn(input, p.name) || Object.hasOwn(input, pascal(p.name));
      let value = provided
        ? Object.hasOwn(input, p.name)
          ? input[p.name]
          : input[pascal(p.name)]
        : data[p.id] ?? p.defaultValue ?? null;
      if (
        provided &&
        ((id && p.isUpdatable === false) || (!id && p.isAddable === false))
      ) {
        if (id && equal(value, data[p.id])) continue;
        if (!id && value == null) continue;
        return fail(403, "field_is_read_only:" + p.name);
      }
      if (Array.isArray(value)) value = value.join(",");
      if (value === "" || value == null) {
        if (p.isRequired) return fail(400, "required_field:" + p.name);
        data[p.id] = null;
        continue;
      }
      switch (p.type.toLowerCase()) {
        case "int":
        case "integer":
          value = Number(value);
          if (!Number.isSafeInteger(value))
            return fail(400, "invalid_integer:" + p.name);
          break;
        case "decimal":
        case "float":
        case "double":
        case "number":
          value = Number(value);
          if (!Number.isFinite(value))
            return fail(400, "invalid_number:" + p.name);
          break;
        case "bool":
        case "boolean":
          if (
            ![
              true,
              false,
              "true",
              "false",
              "True",
              "False",
              1,
              0,
              "1",
              "0",
              "✓",
              "✗",
            ].includes(value)
          )
            return fail(400, "invalid_boolean:" + p.name);
          value = [true, "true", "True", 1, "1", "✓"].includes(value);
          break;
        case "date":
        case "datetime":
          if (!Number.isFinite(Date.parse(text(value))))
            return fail(400, "invalid_date:" + p.name);
          value = text(value);
          break;
        default:
          value = text(value);
      }
      if (
        p.lookup &&
        !text(value)
          .split(",")
          .every((v) => p.lookup.options.some((o: any) => equal(o.value, v)))
      )
        return fail(400, "invalid_lookup:" + p.name);
      if (
        p.relatedFormId &&
        !text(value)
          .split(",")
          .every((v) =>
            this.db
              .query("SELECT id FROM records WHERE id=? AND form_id=?")
              .get(Number(v) || 0, Number(p.relatedFormId))
          )
      )
        return fail(400, "invalid_relation:" + p.name);
      if (
        p.isUnique &&
        this.rows(form.id).some(
          (r) => r.id !== id && equal(JSON.parse(r.data)[p.id], value)
        )
      )
        return fail(409, "unique_field:" + p.name);
      data[p.id] = value;
    }
    return data;
  }
  submit(form: any, input: any): any {
    return this.db.transaction(() => {
      const id = Number(input.id) || 0;
      const data = this.validate(form, input.data, id);
      if (!id && input.checkForDuplicate !== false) {
        const props = form.properties.filter(
          (p: any) => p.isSensitiveToRepetition && data[p.id] != null
        );
        const similar = props.length
          ? this.rows(form.id).filter((r) =>
              props.every((p: any) =>
                equal(JSON.parse(r.data)[p.id], data[p.id])
              )
            )
          : [];
        if (similar.length)
          return {
            id: 0,
            similarData: similar.map((r) => this.present(r, form)),
          };
      }
      const now = new Date().toISOString();
      if (id)
        this.db
          .query(
            "UPDATE records SET data=?,modified_at=? WHERE id=? AND form_id=?"
          )
          .run(JSON.stringify(data), now, id, form.id);
      const recordId =
        id ||
        Number(
          this.db
            .query(
              "INSERT INTO records(form_id,data,created_at,modified_at) VALUES(?,?,?,?)"
            )
            .run(form.id, JSON.stringify(data), now, now).lastInsertRowid
        );
      return { id: recordId, similarData: null };
    })();
  }
  read(form: any, id: number) {
    const row = this.raw(id);
    if (row.form_id !== form.id) return fail(404, "record_not_found");
    return this.present(row, form);
  }
  list(form: any, q: URLSearchParams, all = false) {
    let rows = this.rows(form.id).map((row) => this.present(row, form));
    const filter = q.get("filter") || "";
    if (filter)
      rows = rows.filter((row) =>
        Object.values(row).some((v) =>
          text(v).toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        )
      );
    const sort = q.get("sort") || "Id_DESC";
    const match = sort.match(/^(.*?)(?:[ _](ASC|DESC))?$/i)!;
    const field = match[1];
    const desc = match[2]?.toUpperCase() === "DESC";
    const allowed = new Set([
      "Id",
      "id",
      ...form.properties.flatMap((p: any) => [
        p.name,
        pascal(p.name),
        p.name + "Title",
        pascal(p.name + "Title"),
        ...(p.relatedFormId
          ? [
              p.relatedFormName + p.relatedFormPropertyName,
              pascal(p.relatedFormName + p.relatedFormPropertyName),
            ]
          : []),
      ]),
    ]);
    if (!allowed.has(field)) return fail(400, "invalid_sort");
    const numeric =
      ["Id", "id"].includes(field) ||
      form.properties.some(
        (p: any) =>
          [p.name, pascal(p.name)].includes(field) &&
          ["int", "decimal", "number", "float", "double"].includes(p.type)
      );
    rows.sort((a, b) => {
      const av = a[field],
        bv = b[field];
      let cmp = numeric
        ? Number(av) - Number(bv)
        : text(av).localeCompare(text(bv));
      return (desc ? -cmp : cmp) || b.Id - a.Id;
    });
    const page = Math.max(1, Number(q.get("page")) || 1);
    const take = Math.min(500, Math.max(1, Number(q.get("take")) || 10));
    return {
      items: all ? rows : rows.slice((page - 1) * take, page * take),
      totalCount: rows.length,
      pageNo: page,
      pageSize: take,
    };
  }
  remove(id: number) {
    const row = this.raw(id);
    const form = this.catalog.form(row.form_id);
    if (!form.isDeletable) return fail(403, "form_is_read_only");
    for (const f of this.catalog.forms())
      for (const p of f.properties.filter(
        (p: any) => Number(p.relatedFormId) === form.id
      )) {
        if (
          this.rows(f.id).some(
            (r) =>
              r.id !== id &&
              text(JSON.parse(r.data)[p.id]).split(",").includes(String(id))
          )
        )
          return fail(409, "record_is_referenced");
      }
    this.db.query("DELETE FROM records WHERE id=?").run(id);
    return true;
  }
  dropdown(form: any, q: URLSearchParams) {
    const ids = (q.get("ids") || q.get("id") || "")
      .split(",")
      .filter((x) => Number(x) > 0)
      .map(Number);
    const props = form.properties.filter((p: any) => p.isVisibleInDropdown);
    const labelProps = props.length ? props : form.properties.slice(0, 1);
    const search = q.get("searchvalue") || "";
    return this.rows(form.id)
      .filter((r) => !ids.length || ids.includes(r.id))
      .map((row) => {
        const values = JSON.parse(row.data);
        return {
          Id: row.id,
          Title: labelProps.map((p: any) => text(values[p.id])).join(" - "),
        };
      })
      .filter(
        (r) =>
          !search ||
          r.Title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      )
      .slice(0, 100);
  }
}
