import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { isDatabaseConfigured } from "./env";
import { verifyPassword } from "./password";

// The cookie holds a random token and the database stores only its hash: a
// leaked database can't be used to log in, and removing an admin or logging
// out ends the session immediately.
const COOKIE = "konkreet_admin";
const COOKIE_PATH = "/admin";
const SESSION_DAYS = 14;
const MAX_FAILURES = 10; // per email, per 15 minutes

// Shaped like a real hash, so an unknown email takes as long to check as a known one.
const UNKNOWN_ADMIN_HASH = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;

/** "super" manages accounts; "admin" can only edit the site's projects. */
export type AdminRole = "admin" | "super";

export type Admin = { id: number; email: string; name: string; role: AdminRole };

const toRole = (value: unknown): AdminRole => (value === "super" ? "super" : "admin");

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sql = db();
  await sql`INSERT INTO sessions (token_hash, admin_id, expires_at)
    VALUES (${hashToken(token)}, ${adminId}, ${expires.toISOString()})`;
  await sql`DELETE FROM sessions WHERE expires_at < now()`;

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    expires,
  });
}

export async function attemptLogin(email: string, password: string): Promise<"ok" | "invalid" | "locked"> {
  const sql = db();
  const address = email.trim().toLowerCase();

  const [{ failures }] = await sql`SELECT count(*)::int AS failures FROM login_failures
    WHERE email = ${address} AND failed_at > now() - interval '15 minutes'`;
  if (failures >= MAX_FAILURES) return "locked";

  const [admin] = await sql`SELECT id, password_hash FROM admins WHERE email = ${address}`;
  const valid = await verifyPassword(password, admin?.password_hash ?? UNKNOWN_ADMIN_HASH);
  if (!admin || !valid) {
    await sql`INSERT INTO login_failures (email) VALUES (${address})`;
    return "invalid";
  }

  await sql`DELETE FROM login_failures WHERE email = ${address} OR failed_at < now() - interval '1 day'`;
  await createSession(Number(admin.id));
  return "ok";
}

export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  // Read the cookie first, unconditionally: that is what marks every admin
  // page as rendered per request, so none is ever baked in at build time.
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !isDatabaseConfigured) return null;

  const [row] = await db()`SELECT a.id, a.email, a.name, a.role FROM sessions s
    JOIN admins a ON a.id = s.admin_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()`;
  return row
    ? { id: Number(row.id), email: String(row.email), name: String(row.name), role: toRole(row.role) }
    : null;
});

/** For every admin page and action: the logged-in admin, or a redirect to the login page. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * For anything that manages accounts. Throws rather than redirects, because
 * it guards actions that are reachable by a direct POST.
 */
export async function requireSuperAdmin(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "super") throw new Error("Only the main admin can manage accounts.");
  return admin;
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token && isDatabaseConfigured) {
    await db()`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
  }
  store.delete({ name: COOKIE, path: COOKIE_PATH });
}

/** Logs an admin out everywhere except this browser, e.g. after a password change. */
export async function endOtherSessions(adminId: number) {
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  await db()`DELETE FROM sessions WHERE admin_id = ${adminId} AND token_hash <> ${hashToken(token)}`;
}

/** Logs one admin out of every browser, e.g. after their password was reset for them. */
export async function endAllSessions(adminId: number) {
  await db()`DELETE FROM sessions WHERE admin_id = ${adminId}`;
}

export async function listAdmins() {
  await requireSuperAdmin();
  const rows = await db()`SELECT id, email, name, role, created_at FROM admins ORDER BY created_at, id`;
  return rows.map((row) => ({
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    role: toRole(row.role),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}
