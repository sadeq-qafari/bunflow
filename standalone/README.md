# Flow standalone

An alternative backend for Flow's existing Vue 2 / Quasar panel. A single Bun executable serves the compiled panel, provides its core API contracts, and stores definitions, records, sessions, import previews, and uploaded files in SQLite. SQL Server, Redis, .NET, the gateway, and the other services are not needed for this mode.

## Run the Linux x64 executable

```sh
chmod +x flow
./flow
```

Open **http://127.0.0.1:5000**. The username is **admin**. The first launch prints a randomly generated password once. To choose it yourself, set `FLOW_ADMIN_PASSWORD` on the first launch; it must contain at least eight characters. Setting that variable after a database has been created does not reset the password.

```sh
FLOW_ADMIN_PASSWORD='choose-your-password' ./flow --data-dir ./flow-data --port 5000
```

The default data directory is `~/.local/share/flow`, containing `flow.sqlite`. The database is a separate writable file; it is never baked into the executable. Stop Flow before copying its data directory for a physical backup. Do not copy only the main SQLite file while the app is running, because WAL files can contain recent writes.

The server listens on loopback by default. `--host`, `--port`, and `--data-dir` configure it; `--help` lists options. `FLOW_PORT` and `FLOW_DATA_DIR` are environment alternatives. The executable includes the runtime and frontend, so end users do not need Bun, Node, npm, or a separate web server.

## Build from source

Development/build dependencies are Bun and Node/npm. From this archive's `source` directory, or the root of a Flow checkout containing these changes:

```sh
cd panel
npm ci --legacy-peer-deps --ignore-scripts
cd ../standalone
bun install --frozen-lockfile
bun test
bunx tsc --noEmit
bun run build
```

The output is `standalone/dist/flow`. The build script sets `FLOW_STANDALONE=1`, builds the original Quasar SPA, embeds its assets, and compiles the server. Windows and macOS binaries need their own target/build:

```sh
bun scripts/build.ts --target=bun-windows-x64
bun scripts/build.ts --target=bun-darwin-arm64
```

Only the Linux x64 artifact is tested in this delivery. `--skip-panel` reuses a previously built standalone panel; do not use it with a frontend built for the old services. Generated asset files and binaries are intentionally excluded from source.

## Included behavior

- Existing login, dashboard, form administration, visual designer, record forms/grids, and option-list screens.
- Form/field definitions, layouts, default values, required/unique checks, duplicate warning fields, insert/update/delete flags, and stable field IDs.
- Relationships between forms, including multiple selections, and readable relationship/lookup labels in grids and Excel exports.
- Record creation, editing, deletion, sorting, pagination, grid filtering, cross-form search, and dropdown selection.
- Excel `.xlsx` export and import, staged previews with selected-row insertion, related-record creation/reuse, transactional rollback, expiring previews, and stale-schema detection. Imports are limited to 20 MiB and 10,000 data rows. Formula cells are rejected; save pasted values instead.
- JSON schema export/import and optional full-data bundles, with ID remapping and rollback on conflicts.
- One local administrator and one workspace. Passwords use Argon2id; sessions and rotating refresh tokens persist in SQLite.

Records store typed values keyed by stable property IDs. Renaming fields or forms preserves values. Deleting a populated field, changing the type/relation of a populated field, invalidating required/unique constraints, or deleting referenced data returns a conflict instead of silently corrupting data.

Grid queries currently read one form's records into memory before sorting/filtering. This version targets small local datastores; large installations will need indexed SQL queries and query limits before use at scale.

## Schema/data transfers

The original panel has no dedicated schema transfer controls, so these additions are API endpoints. Log in with `POST /api/identity/account/token` using `{"username":"admin","password":"...","type":1}` and send the returned `result.accessToken` in an `Authorization: Bearer ...` header.

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/flow/schema/export` | JSON containing form definitions and lookups |
| GET | `/api/flow/schema/export?includeData=true` | Definitions, lookups, and records |
| POST | `/api/flow/schema/import` | Import that JSON as the request body |

Importing a bundle creates new forms. Existing form names cause a conflict; imports do not overwrite or merge existing data. Full-data bundles preserve relations through remapped IDs, but do not include uploaded file bytes, users, sessions, or original record audit timestamps. A stopped-app copy of the full data directory is the complete backup.

## Compatibility boundaries

This replaces the **core datastore flows**, not every service in the old framework. The old .NET services remain untouched in the original repository and can still be run separately.

- No automatic conversion of an existing SQL Server database or historical schema export format is included. This executable starts with an empty datastore. Existing records can be moved using Excel after recreating the forms; a dedicated SQL Server migration needs the old database/schema.
- SQL Server stored procedures, custom server SQL actions, query-backed lookups, computed/script-rule fields, custom reports, workflow automation, external notification/SignalR services, and the old multi-user/multi-tenant permission system are not migrated. Unsupported operations return explicit errors.
- Custom action definitions can be preserved, but this backend does not execute arbitrary client/server scripts. The original panel's preset/custom action buttons already lack action handlers in `FormView.vue`.
- The generated element catalog covers the input components actually used by Flow: text, textarea, number, option/related selection, multiple selection, checkbox, money, date, time, and email. Extra elements from an existing database need mapping during migration.

The panel's layout and screen structure are preserved. Its small compatibility changes are limited to standalone API routing, metadata loading after authentication, accepting `admin` in the formerly numeric-only login input, refreshing form definitions after saves, disabling external automatic error reporting in standalone mode, and repairing the existing Webpack 4/Babel build.

## Validation

The backend integration suite exercises authentication/refresh, Vue bootstrap contracts, static history routing, record/form CRUD, field renames, required/unique/type validation, relationship lookups and delete constraints, Excel preview/export/batch rollback, stale previews, schema/data round trips, and schema evolution conflicts. The Linux executable is also checked in a browser using the existing login, form designer, record form, and grid screens.
