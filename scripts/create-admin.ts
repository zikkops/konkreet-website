/**
 * Creates a login, or resets the password if that email already exists:
 *
 *   npm run admin:create -- you@example.com "Your Name"
 *   npm run admin:create -- you@example.com "Your Name" --super
 *
 * The very first account is the main admin (the only one who manages users);
 * add --super to make another account the main admin too. Prints a generated
 * password once — log in at /admin/login, then change it under My account.
 */
import { randomBytes } from "node:crypto";
import { db } from "../src/server/db";
import { hashPassword } from "../src/server/password";

async function main() {
  const args = process.argv.slice(2);
  const wantsSuper = args.includes("--super");
  const [rawEmail, ...nameParts] = args.filter((arg) => arg !== "--super");
  const email = rawEmail?.trim().toLowerCase() ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage: npm run admin:create -- you@example.com "Your Name" [--super]');
    process.exit(1);
  }

  const sql = db();
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM admins`;
  // Whoever sets the site up first is the main admin.
  const role = wantsSuper || count === 0 ? "super" : "admin";
  const password = randomBytes(12).toString("base64url");

  const [row] = await sql`INSERT INTO admins (email, name, password_hash, role)
    VALUES (${email}, ${nameParts.join(" ")}, ${await hashPassword(password)}, ${role})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id, (xmax = 0) AS created`;

  if (role === "super") await sql`UPDATE admins SET role = 'super' WHERE id = ${row.id}`;
  // A new password means every existing session for that person is stale.
  if (!row.created) await sql`DELETE FROM sessions WHERE admin_id = ${row.id}`;

  console.log(row.created ? `Created ${email}.` : `Reset the password for ${email}.`);
  if (role === "super") console.log("This account is the main admin (manages users).");
  console.log(`Password: ${password}`);
  console.log("Log in at /admin/login, then change it under My account.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
