import type { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import { fail } from "./db";

const permissions = {
  flow: {
    form: ["insert", "read", "update", "delete"],
    lookup: ["insert", "read", "update", "delete"],
    formlead: ["insert", "read", "update", "delete"],
  },
};
export class Auth {
  attempts = new Map<string, { count: number; until: number }>();
  constructor(public db: Database) {}
  async initialize(password?: string) {
    if (this.db.query("SELECT id FROM users LIMIT 1").get()) return null;
    const generated = password || randomBytes(12).toString("base64url");
    if (generated.length < 8)
      return fail(400, "initial_password_must_have_8_characters");
    this.db
      .query("INSERT INTO users(id,username,password_hash) VALUES(1,?,?)")
      .run(
        "admin",
        await Bun.password.hash(generated, { algorithm: "argon2id" })
      );
    return generated;
  }
  user(request: Request): any {
    const token = (request.headers.get("authorization") || "").replace(
      /^Bearer\s+/i,
      ""
    );
    const session = this.db
      .query(
        "SELECT user_id FROM sessions WHERE token=? AND kind='access' AND expires>?"
      )
      .get(token, Date.now()) as any;
    if (!session) return fail(401, "invalid_session");
    return this.db
      .query("SELECT id,username FROM users WHERE id=?")
      .get(session.user_id);
  }
  info(user: any) {
    return {
      claims: {
        sub: String(user.id),
        username: user.username,
        given_name: "مدیر",
        family_name: "",
        role: "admin",
        tenant_id: "1",
        branch_id: "1",
        email: "",
      },
      permissions,
    };
  }
  tenants(user: any) {
    return [
      {
        id: 1,
        title: "Flow",
        branchId: 1,
        branchTitle: "Flow",
        userId: user.id,
        isDefault: true,
        roleCount: 1,
        logo: null,
        baseUrls: { flow: "", core: "", identity: "", tenant: "" },
      },
    ];
  }
  issue(user: any) {
    const accessToken = randomBytes(32).toString("base64url");
    const refreshToken = randomBytes(32).toString("base64url");
    this.db.query("DELETE FROM sessions WHERE expires<=?").run(Date.now());
    this.db
      .query("INSERT INTO sessions VALUES(?,?,?,?)")
      .run(accessToken, user.id, "access", Date.now() + 3600_000);
    this.db
      .query("INSERT INTO sessions VALUES(?,?,?,?)")
      .run(refreshToken, user.id, "refresh", Date.now() + 30 * 86400_000);
    return {
      ...this.info(user),
      accessToken,
      refreshToken,
      tenants: this.tenants(user),
    };
  }
  async login(input: any, client: string) {
    if (Number(input.type) === 3) {
      return this.db.transaction(() => {
        const session = this.db
          .query(
            "SELECT user_id FROM sessions WHERE token=? AND kind='refresh' AND expires>?"
          )
          .get(textToken(input.refreshToken), Date.now()) as any;
        if (!session) return fail(401, "invalid_refresh_token");
        this.db
          .query("DELETE FROM sessions WHERE token=?")
          .run(input.refreshToken);
        return this.issue(
          this.db
            .query("SELECT id,username FROM users WHERE id=?")
            .get(session.user_id)
        );
      })();
    }
    if (Number(input.type) !== 1)
      return fail(422, "tenant_switching_not_supported");
    const previous = this.attempts.get(client);
    if (previous && previous.until > Date.now() && previous.count >= 10)
      return fail(429, "too_many_login_attempts");
    const attempt =
      previous && previous.until > Date.now()
        ? previous
        : { count: 0, until: Date.now() + 60_000 };
    attempt.count++;
    this.attempts.set(client, attempt);
    if (this.attempts.size > 1000)
      for (const [key, val] of this.attempts)
        if (val.until < Date.now()) this.attempts.delete(key);
    const user = this.db
      .query("SELECT * FROM users WHERE username=?")
      .get(String(input.username || "")) as any;
    if (
      !user ||
      !(await Bun.password.verify(
        String(input.password || ""),
        user.password_hash
      ))
    )
      return fail(401, "invalid_credentials");
    this.attempts.delete(client);
    return this.issue(user);
  }
  async changePassword(user: any, input: any) {
    const stored = this.db
      .query("SELECT password_hash FROM users WHERE id=?")
      .get(user.id) as any;
    if (
      !(await Bun.password.verify(
        String(input.password || ""),
        stored.password_hash
      ))
    )
      return fail(401, "invalid_credentials");
    if (typeof input.newPassword !== "string" || input.newPassword.length < 8)
      return fail(400, "password_must_have_8_characters");
    const hash = await Bun.password.hash(input.newPassword, {
      algorithm: "argon2id",
    });
    this.db.transaction(() => {
      this.db
        .query("UPDATE users SET password_hash=? WHERE id=?")
        .run(hash, user.id);
      this.db.query("DELETE FROM sessions WHERE user_id=?").run(user.id);
    })();
    return true;
  }
}
const textToken = (value: any) => (typeof value === "string" ? value : "");
