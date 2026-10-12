import type { Database } from "bun:sqlite";
import { fail, bumpVersion, nameIsValid } from "./db";
import { elements } from "./elements";

export class Catalog {
  constructor(public db: Database) {}
  rawForm(idOrName: number | string): any {
    const row =
      typeof idOrName === "number"
        ? this.db
            .query("SELECT id,definition FROM forms WHERE id=?")
            .get(idOrName)
        : this.db
            .query("SELECT id,definition FROM forms WHERE name=?")
            .get(idOrName);
    if (!row) return fail(404, "form_not_found");
    return { ...JSON.parse((row as any).definition), id: (row as any).id };
  }
  lookup(id: number): any {
    const row = this.db
      .query("SELECT definition FROM lookups WHERE id=?")
      .get(id) as any;
    if (!row) return fail(404, "lookup_not_found");
    return { ...JSON.parse(row.definition), id };
  }
  lookups(): any[] {
    return (
      this.db.query("SELECT id FROM lookups ORDER BY id").all() as any[]
    ).map((x) => this.lookup(x.id));
  }
  properties(id: number): any[] {
    return (
      this.db
        .query(
          "SELECT id,definition FROM properties WHERE form_id=? ORDER BY id"
        )
        .all(id) as any[]
    )
      .map((row) => ({ ...JSON.parse(row.definition), id: row.id, formId: id }))
      .sort((a, b) => a.layoutIndex - b.layoutIndex);
  }
  form(idOrName: number | string): any {
    const form = this.rawForm(idOrName);
    return {
      ...form,
      baseUrl: "",
      tenantId: 1,
      actions: form.actionItems || [],
      properties: this.properties(form.id).map((p) => {
        const related = p.relatedFormId
          ? this.rawForm(Number(p.relatedFormId))
          : null;
        const relatedProp = related
          ? this.properties(related.id).find(
              (r) => r.id === Number(p.relatedFormPropertyId)
            )
          : null;
        const lookup = p.lookupId ? this.lookup(Number(p.lookupId)) : null;
        return {
          ...p,
          element: elements.find((e) => e.id === Number(p.elementId)),
          relatedFormName: related?.name || null,
          relatedFormPropertyName: relatedProp?.name || null,
          lookup: lookup ? { ...lookup, options: lookup.items || [] } : null,
        };
      }),
    };
  }
  forms(): any[] {
    return (
      this.db.query("SELECT id FROM forms ORDER BY id").all() as any[]
    ).map((x) => this.form(x.id));
  }
  info(id: number) {
    const f = this.form(id);
    return { ...f, formProperties: f.properties, formActions: f.actions };
  }
  upsert(input: any): number {
    if (!nameIsValid(input.name) || !input.title?.trim())
      return fail(400, "invalid_form_name_or_title");
    const id = Number(input.id) || 0;
    if (id) this.rawForm(id);
    const items = input.items || input.properties || [];
    if (!Array.isArray(items) || items.length > 200)
      return fail(400, "invalid_properties");
    const keys = new Set<string>();
    const positions = new Set<number>();
    for (const p of items) {
      if (
        !nameIsValid(p.name) ||
        [
          "id",
          "tenantid",
          "createdat",
          "modifiedat",
          "createdby",
          "modifiedby",
        ].includes(p.name.toLowerCase()) ||
        !p.title?.trim() ||
        keys.has(p.name.toLowerCase())
      )
        return fail(400, "invalid_or_duplicate_field");
      keys.add(p.name.toLowerCase());
      if (
        !Number.isInteger(Number(p.layoutIndex)) ||
        positions.has(Number(p.layoutIndex))
      )
        return fail(400, "invalid_layout_index");
      positions.add(Number(p.layoutIndex));
      if (
        !elements.some(
          (e) =>
            e.id === Number(p.elementId) &&
            e.acceptableTypes.split(",").includes(p.type)
        )
      )
        return fail(400, "invalid_field_type");
      if (p.isComputed || p.rules?.trim())
        return fail(422, "computed_fields_and_script_rules_need_migration");
      if (p.lookupId) this.lookup(Number(p.lookupId));
      if (p.relatedFormId) {
        const r = this.rawForm(Number(p.relatedFormId));
        if (
          !this.properties(r.id).some(
            (rp) => rp.id === Number(p.relatedFormPropertyId)
          )
        )
          return fail(400, "related_property_not_found");
      }
    }
    let layout: any[];
    try {
      layout = JSON.parse(input.layout || "[]");
    } catch {
      return fail(400, "invalid_layout");
    }
    if (
      !Array.isArray(layout) ||
      layout.length !== items.length ||
      items.some(
        (p: any) => !layout.some((l) => Number(l.i) === Number(p.layoutIndex))
      ) ||
      layout.some((l) => !Number.isInteger(l.w) || l.w < 1 || l.w > 12)
    )
      return fail(400, "invalid_layout");
    if (
      (input.actionItems || []).some(
        (a: any) => Number(a.typeLookup) === 1 && a.script?.trim()
      )
    )
      return fail(422, "server_sql_actions_need_migration");
    return this.db.transaction(() => {
      let formId = id;
      const duplicate = this.db
        .query("SELECT id FROM forms WHERE name=? AND id<>?")
        .get(input.name, id);
      if (duplicate) return fail(409, "form_name_exists");
      const definition = { ...input };
      delete definition.items;
      delete definition.properties;
      delete definition.id;
      if (id)
        this.db
          .query("UPDATE forms SET name=?,definition=? WHERE id=?")
          .run(input.name, JSON.stringify(definition), id);
      else
        formId = Number(
          this.db
            .query("INSERT INTO forms(name,definition) VALUES(?,?)")
            .run(input.name, JSON.stringify(definition)).lastInsertRowid
        );
      const existing = this.properties(formId);
      const stored = (
        this.db
          .query("SELECT data FROM records WHERE form_id=?")
          .all(formId) as any[]
      ).map((r) => JSON.parse(r.data));
      const retained = new Set<number>();
      // Temporarily rename existing fields so simultaneous renames do not collide.
      for (const p of existing)
        this.db
          .query("UPDATE properties SET name=? WHERE id=?")
          .run("_pending_" + p.id, p.id);
      for (const p of items) {
        const previous = existing.find((x) =>
          p.id
            ? x.id === Number(p.id)
            : x.name.toLowerCase() === p.name.toLowerCase()
        );
        if (p.id && !previous) return fail(400, "property_not_owned_by_form");
        const values = stored.map((r) => (previous ? r[previous.id] : null));
        const hasValues = values.some((v) => v != null && v !== "");
        if (
          previous &&
          hasValues &&
          ["type", "relatedFormId", "relatedFormPropertyId", "lookupId"].some(
            (k) => String(previous[k] ?? "") !== String(p[k] ?? "")
          )
        )
          return fail(
            409,
            "populated_field_type_or_relation_change_requires_migration"
          );
        if (p.isRequired && values.some((v) => v == null || v === ""))
          return fail(409, "existing_records_missing_required_field");
        if (p.isUnique) {
          const seen = new Set<string>();
          for (const value of values) {
            if (value == null || value === "") continue;
            const key = String(value).trim();
            if (seen.has(key))
              return fail(409, "existing_records_are_not_unique");
            seen.add(key);
          }
        }
        const def = {
          isActive: true,
          isAddable: true,
          isUpdatable: true,
          isFilterable: true,
          ...p,
        };
        delete def.id;
        delete def.element;
        delete def.lookup;
        if (previous) {
          this.db
            .query("UPDATE properties SET name=?,definition=? WHERE id=?")
            .run(p.name, JSON.stringify(def), previous.id);
          retained.add(previous.id);
        } else
          retained.add(
            Number(
              this.db
                .query(
                  "INSERT INTO properties(form_id,name,definition) VALUES(?,?,?)"
                )
                .run(formId, p.name, JSON.stringify(def)).lastInsertRowid
            )
          );
      }
      for (const p of existing)
        if (!retained.has(p.id)) {
          if (this.formsReferencingProperty(p.id))
            return fail(409, "field_is_referenced");
          // Deleting a field with stored data must be deliberate; do not silently discard it.
          if (
            (
              this.db
                .query("SELECT data FROM records WHERE form_id=?")
                .all(formId) as any[]
            ).some((r) => JSON.parse(r.data)[p.id] != null)
          )
            return fail(409, "field_has_data");
          this.db.query("DELETE FROM properties WHERE id=?").run(p.id);
        }
      bumpVersion(this.db);
      return formId;
    })();
  }
  formsReferencingProperty(id: number) {
    return (
      this.db.query("SELECT definition FROM properties").all() as any[]
    ).some(
      (r) => Number(JSON.parse(r.definition).relatedFormPropertyId) === id
    );
  }
  remove(id: number) {
    this.rawForm(id);
    if (
      (
        this.db
          .query("SELECT definition FROM properties WHERE form_id<>?")
          .all(id) as any[]
      ).some((r) => Number(JSON.parse(r.definition).relatedFormId) === id)
    )
      return fail(409, "form_is_referenced");
    this.db.transaction(() => {
      this.db.query("DELETE FROM forms WHERE id=?").run(id);
      bumpVersion(this.db);
    })();
    return true;
  }
  upsertLookup(input: any) {
    if (
      !input.title?.trim() ||
      Number(input.typeLookup) !== 1 ||
      !Array.isArray(input.items)
    )
      return fail(422, "only_option_lookups_supported");
    const values = new Set<string>();
    for (const item of input.items) {
      if (
        !item.title?.trim() ||
        item.value == null ||
        values.has(String(item.value))
      )
        return fail(400, "invalid_lookup_option");
      values.add(String(item.value));
    }
    const id = Number(input.id) || 0;
    if (id) this.lookup(id);
    if (id)
      for (const form of this.forms())
        for (const prop of form.properties.filter(
          (p: any) => Number(p.lookupId) === id
        )) {
          const used = this.db
            .query("SELECT data FROM records WHERE form_id=?")
            .all(form.id) as any[];
          if (
            used.some((r) => {
              const value = JSON.parse(r.data)[prop.id];
              return (
                value != null &&
                String(value)
                  .split(",")
                  .some((v) => !values.has(v))
              );
            })
          )
            return fail(409, "lookup_option_is_used");
        }
    const data = { ...input, isActive: true };
    delete data.id;
    if (id)
      this.db
        .query("UPDATE lookups SET definition=? WHERE id=?")
        .run(JSON.stringify(data), id);
    const result =
      id ||
      Number(
        this.db
          .query("INSERT INTO lookups(definition) VALUES(?)")
          .run(JSON.stringify(data)).lastInsertRowid
      );
    bumpVersion(this.db);
    return result;
  }
}
