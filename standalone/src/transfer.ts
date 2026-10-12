import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import type { Catalog } from "./catalog";
import { Records, text, pascal } from "./records";
import { fail } from "./db";

type StagedRow = { Id: string; data: Record<string, any> };
type Stage = {
  main: number;
  forms: Record<string, StagedRow[]>;
  signatures: Record<string, string>;
};
export class Transfer {
  constructor(public catalog: Catalog, public records: Records) {}
  async excel(form: any, q: URLSearchParams): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(
      (form.title || form.name).replace(/[\\/*?:\[\]]/g, " ").slice(0, 31) ||
        "Data",
      { views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }] }
    );
    const props = form.properties.filter((p: any) => !p.isHiddenInGrid);
    sheet.addRow(props.map((p: any) => p.title));
    sheet.getRow(1).font = { bold: true };
    for (const row of this.records.list(form, q, true).items) {
      sheet.addRow(
        props.map(
          (p: any) =>
            row[
              p.relatedFormId
                ? p.relatedFormName + p.relatedFormPropertyName
                : p.lookupId
                ? p.name + "Title"
                : p.name
            ] ?? null
        )
      );
    }
    sheet.columns.forEach((c) => (c.width = 24));
    return new Uint8Array((await workbook.xlsx.writeBuffer()) as ArrayBuffer);
  }
  async stage(form: any, file: File, userId: number) {
    if (file.size > 20 * 1024 * 1024) return fail(413, "import_file_too_large");
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()) as any);
    } catch {
      return fail(400, "could_not_read_excel_file");
    }
    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount < 2 || sheet.rowCount > 10_001)
      return fail(400, "excel_requires_1_to_10000_data_rows");
    const stage: Stage = {
      main: form.id,
      forms: { [form.id]: [] },
      signatures: {},
    };
    const cols = new Map<number, any>();
    sheet.getRow(1).eachCell((cell, col) => {
      const p = form.properties.find(
        (p: any) =>
          p.title.replace(/\s/g, "") === cell.text.trim().replace(/\s/g, "") ||
          p.name === cell.text.trim()
      );
      if (p) {
        if ([...cols.values()].some((v) => v.id === p.id))
          return fail(400, "duplicate_excel_column");
        cols.set(col, p);
      }
    });
    if (!cols.size) return fail(400, "no_matching_excel_columns");
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      if ([...cols.keys()].every((col) => row.getCell(col).text.trim() === ""))
        continue;
      const staged: StagedRow = { Id: form.id + "_" + randomUUID(), data: {} };
      for (const [col, p] of cols) {
        const cell = row.getCell(col);
        let value: any = cell.value;
        if (value && typeof value === "object" && "formula" in value)
          return fail(400, "excel_formulas_not_supported");
        if (value instanceof Date) value = value.toISOString();
        else if (value && typeof value === "object") value = cell.text;
        if (p.relatedFormId && value != null && text(value).trim()) {
          const related = this.catalog.form(Number(p.relatedFormId));
          const rp = related.properties.find(
            (x: any) => x.id === Number(p.relatedFormPropertyId)
          );
          if (!rp) return fail(400, "related_property_not_found");
          const normalize = (v: any) => text(v).replace(/\s/g, "");
          const parts =
            p.element.name === "multi_select_input"
              ? text(value).split(",")
              : [value];
          value = parts
            .map((v) => {
              const existing = this.records
                .rows(related.id)
                .find(
                  (r) => normalize(JSON.parse(r.data)[rp.id]) === normalize(v)
                );
              if (existing) return existing.id;
              const pack = (stage.forms[related.id] ||= []);
              let pending = pack.find(
                (r) => normalize(r.data[rp.name]) === normalize(v)
              );
              if (!pending) {
                pending = {
                  Id: related.id + "_" + randomUUID(),
                  data: { [rp.name]: v },
                };
                pack.push(pending);
              }
              return pending.Id;
            })
            .join(",");
        } else if (p.lookup && value != null && text(value).trim()) {
          value = text(value)
            .split(",")
            .map((v) => {
              const option = p.lookup.options.find(
                (o: any) =>
                  o.title.trim() === v.trim() || text(o.value) === v.trim()
              );
              if (!option) return fail(400, "unknown_lookup_label:" + p.name);
              return option.value;
            })
            .join(",");
        }
        staged.data[p.name] = value;
      }
      stage.forms[form.id].push(staged);
    }
    const forms: any = {};
    for (const [id, rows] of Object.entries(stage.forms)) {
      const f = this.catalog.form(Number(id));
      stage.signatures[id] = this.signature(f);
      forms[f.name] = rows.map((r) => {
        const row: any = { Id: r.Id, is_checked: true, ...r.data };
        for (const p of f.properties) {
          const v = r.data[p.name];
          row[pascal(p.name)] = v;
          if (p.lookup) {
            const title = p.lookup.options
              .filter((o: any) => text(v).split(",").includes(text(o.value)))
              .map((o: any) => o.title)
              .join(", ");
            row[p.name + "Title"] = title;
            row[pascal(p.name + "Title")] = title;
          }
          if (p.relatedFormId) {
            const rel = this.catalog.form(Number(p.relatedFormId));
            const rp = rel.properties.find(
              (x: any) => x.id === Number(p.relatedFormPropertyId)
            );
            const labels = text(v)
              .split(",")
              .map((id) => {
                const pending = stage.forms[rel.id]?.find((r) => r.Id === id);
                if (pending) return pending.data[rp.name];
                const existing = this.catalog.db
                  .query("SELECT data FROM records WHERE id=? AND form_id=?")
                  .get(Number(id) || 0, rel.id) as any;
                return existing ? JSON.parse(existing.data)[rp.id] : null;
              });
            const k = p.relatedFormName + p.relatedFormPropertyName;
            row[k] = labels.filter((v) => v != null).join(", ");
            row[pascal(k)] = row[k];
          }
        }
        return row;
      });
    }
    const reference = randomUUID();
    this.catalog.db
      .query("DELETE FROM imports WHERE expires<=?")
      .run(Date.now());
    this.catalog.db
      .query("INSERT INTO imports VALUES(?,?,?,?)")
      .run(reference, userId, JSON.stringify(stage), Date.now() + 8 * 3600_000);
    return { reference, forms };
  }
  signature(form: any) {
    return JSON.stringify(form);
  }
  batch(input: any, userId: number) {
    const stored = this.catalog.db
      .query(
        "SELECT payload FROM imports WHERE reference=? AND user_id=? AND expires>?"
      )
      .get(String(input.reference || ""), userId, Date.now()) as any;
    if (!stored) return fail(404, "import_preview_expired");
    const stage: Stage = JSON.parse(stored.payload);
    if (Number(input.formId) !== stage.main)
      return fail(400, "import_form_mismatch");
    for (const [id, sig] of Object.entries(stage.signatures))
      if (this.signature(this.catalog.form(Number(id))) !== sig)
        return fail(409, "form_changed_since_import_preview");
    const all = new Map<string, { formId: number; row: StagedRow }>();
    for (const [id, rows] of Object.entries(stage.forms))
      for (const row of rows) all.set(row.Id, { formId: Number(id), row });
    const selected = new Set<string>();
    for (const [id, ids] of Object.entries(input.selectedItems || {})) {
      if (!Array.isArray(ids)) return fail(400, "invalid_import_selection");
      for (const key of ids) {
        const item = all.get(String(key));
        if (!item || item.formId !== Number(id))
          return fail(400, "invalid_import_selection");
        selected.add(String(key));
      }
    }
    if (!selected.size) return fail(400, "no_rows_selected");
    // Add only dependencies of selected rows; do not import dependencies for deselected records.
    for (const id of selected) {
      const item = all.get(id)!;
      for (const value of Object.values(item.row.data))
        for (const key of text(value).split(","))
          if (all.has(key)) selected.add(key);
    }
    return this.catalog.db.transaction(() => {
      const remap = new Map<string, number>();
      const now = new Date().toISOString();
      // Allocate all IDs first, allowing self references and cycles.
      for (const key of selected) {
        const item = all.get(key)!;
        const f = this.catalog.form(item.formId);
        if (!f.isAddable) return fail(403, "form_is_read_only");
        remap.set(
          key,
          Number(
            this.catalog.db
              .query(
                "INSERT INTO records(form_id,data,created_at,modified_at) VALUES(?,?,?,?)"
              )
              .run(item.formId, "{}", now, now).lastInsertRowid
          )
        );
      }
      for (const key of selected) {
        const item = all.get(key)!;
        const f = this.catalog.form(item.formId);
        const values = { ...item.row.data };
        for (const p of f.properties.filter((p: any) => p.relatedFormId))
          if (values[p.name] != null)
            values[p.name] = text(values[p.name])
              .split(",")
              .map((v) => remap.get(v) ?? v)
              .join(",");
        const data = this.records.validate(f, values);
        this.catalog.db
          .query("UPDATE records SET data=? WHERE id=?")
          .run(JSON.stringify(data), remap.get(key)!);
      }
      this.catalog.db
        .query("DELETE FROM imports WHERE reference=?")
        .run(input.reference);
      return true;
    })();
  }
  bundle(includeData = false) {
    const forms = this.catalog.forms();
    return {
      format: "flow-standalone",
      version: 1,
      exportedAt: new Date().toISOString(),
      lookups: this.catalog.lookups(),
      forms: forms.map((f) => ({
        ...f,
        items: f.properties,
        actionItems: f.actions,
      })),
      ...(includeData
        ? {
            records: forms.flatMap((f) =>
              this.records
                .rows(f.id)
                .map((row) => ({
                  id: row.id,
                  formId: f.id,
                  data: Object.fromEntries(
                    f.properties.map((p: any) => [
                      p.name,
                      JSON.parse(row.data)[p.id] ?? null,
                    ])
                  ),
                }))
            ),
          }
        : {}),
    };
  }
  importBundle(bundle: any) {
    if (
      bundle.format !== "flow-standalone" ||
      bundle.version !== 1 ||
      !Array.isArray(bundle.forms) ||
      !Array.isArray(bundle.lookups) ||
      bundle.forms.length > 1000
    )
      return fail(400, "invalid_flow_bundle");
    return this.catalog.db.transaction(() => {
      const formMap = new Map<number, number>(),
        propMap = new Map<number, number>(),
        lookupMap = new Map<number, number>();
      for (const lookup of bundle.lookups) {
        if (lookupMap.has(lookup.id)) return fail(400, "duplicate_lookup_id");
        lookupMap.set(
          lookup.id,
          this.catalog.upsertLookup({ ...lookup, id: 0 })
        );
      }
      for (const f of bundle.forms) {
        if (formMap.has(f.id)) return fail(400, "duplicate_form_id");
        const items = (f.items || f.properties || []).map((p: any) => ({
          ...p,
          id: 0,
          relatedFormId: null,
          relatedFormPropertyId: null,
          lookupId: p.lookupId ? lookupMap.get(p.lookupId) : null,
        }));
        if (
          (f.items || f.properties || []).some(
            (p: any) => p.lookupId && !lookupMap.has(p.lookupId)
          )
        )
          return fail(400, "bundle_lookup_not_found");
        const id = this.catalog.upsert({ ...f, id: 0, items });
        formMap.set(f.id, id);
        const props = this.catalog.properties(id);
        for (const p of f.items || f.properties || []) {
          if (propMap.has(p.id)) return fail(400, "duplicate_property_id");
          propMap.set(p.id, props.find((x) => x.name === p.name)!.id);
        }
      }
      for (const f of bundle.forms) {
        const id = formMap.get(f.id)!;
        const props = this.catalog.properties(id);
        const items = (f.items || f.properties || []).map((p: any) => {
          if (
            p.relatedFormId &&
            (!formMap.has(p.relatedFormId) ||
              !propMap.has(p.relatedFormPropertyId))
          )
            return fail(400, "bundle_relation_not_found");
          return {
            ...p,
            id: props.find((x) => x.name === p.name)!.id,
            lookupId: p.lookupId ? lookupMap.get(p.lookupId) : null,
            relatedFormId: p.relatedFormId
              ? formMap.get(p.relatedFormId)
              : null,
            relatedFormPropertyId: p.relatedFormPropertyId
              ? propMap.get(p.relatedFormPropertyId)
              : null,
          };
        });
        this.catalog.upsert({ ...f, id, items });
      }
      const recordMap = new Map<number, number>();
      const now = new Date().toISOString();
      if (bundle.records && !Array.isArray(bundle.records))
        return fail(400, "invalid_bundle_records");
      for (const r of bundle.records || []) {
        const formId = formMap.get(r.formId);
        if (!formId || recordMap.has(r.id))
          return fail(400, "invalid_bundle_record");
        recordMap.set(
          r.id,
          Number(
            this.catalog.db
              .query(
                "INSERT INTO records(form_id,data,created_at,modified_at) VALUES(?,?,?,?)"
              )
              .run(formId, "{}", now, now).lastInsertRowid
          )
        );
      }
      for (const r of bundle.records || []) {
        const f = this.catalog.form(formMap.get(r.formId)!);
        const values = { ...r.data };
        for (const p of f.properties.filter((p: any) => p.relatedFormId))
          if (values[p.name] != null)
            values[p.name] = text(values[p.name])
              .split(",")
              .map(
                (v) =>
                  recordMap.get(Number(v)) ??
                  fail(400, "bundle_record_relation_not_found")
              )
              .join(",");
        // Restoration is permitted even for schemas whose forms are read only.
        const data = this.records.validate(
          {
            ...f,
            isAddable: true,
            properties: f.properties.map((p: any) => ({
              ...p,
              isAddable: true,
            })),
          },
          values
        );
        this.catalog.db
          .query("UPDATE records SET data=? WHERE id=?")
          .run(JSON.stringify(data), recordMap.get(r.id)!);
      }
      return { forms: formMap.size, records: recordMap.size };
    })();
  }
}
