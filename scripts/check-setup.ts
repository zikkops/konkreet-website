/**
 * Checks that the keys in .env.local actually work, before running the setup:
 *
 *   npm run check
 *
 * Reads nothing and writes nothing; it only asks each service who it is.
 */
import ImageKit from "@imagekit/nodejs";
import { neon } from "@neondatabase/serverless";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function main() {
  const problems: string[] = [];

  // 1. The database
  if (!process.env.DATABASE_URL) {
    problems.push("DATABASE_URL is empty. Paste your Neon connection string into .env.local.");
  } else {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const [row] = await sql`SELECT current_database() AS db, version() AS version`;
      const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
      console.log(`Database  ✓ connected to "${row.db}" (${String(row.version).split(" ").slice(0, 2).join(" ")})`);
      console.log(
        tables.length > 0
          ? `            tables: ${tables.map((t) => t.tablename).join(", ")}`
          : "            no tables yet — run npm run db:setup",
      );

      // Does anything still point at the photos in public/images?
      if (tables.some((table) => table.tablename === "projects")) {
        const [content] = await sql`SELECT
          (SELECT count(*)::int FROM projects) AS projects,
          (SELECT count(*)::int FROM site_settings WHERE data::text LIKE '%/images/%') AS settings_local,
          (SELECT count(*)::int FROM projects
            WHERE cover_image LIKE '/images/%' OR gallery::text LIKE '%/images/%') AS projects_local`;
        const local = Number(content.settings_local) + Number(content.projects_local);
        console.log(
          `            ${content.projects} projects; ${
            local === 0 ? "no photos left in public/images" : `${local} record(s) still using public/images`
          }`,
        );
      }
    } catch (error) {
      problems.push(`Database: ${message(error)}`);
    }
  }

  // 2. ImageKit
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT ?? "";
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
    problems.push("IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY is empty.");
  } else {
    try {
      const client = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });
      const assets = await client.assets.list({ limit: 1 });
      console.log(`ImageKit  ✓ connected (media library has ${assets.length === 0 ? "no" : "at least one"} file)`);
    } catch (error) {
      problems.push(`ImageKit: ${message(error)}`);
    }
  }
  if (!/^https:\/\/ik\.imagekit\.io\/[^/]+\/?$/.test(endpoint)) {
    problems.push(`IMAGEKIT_URL_ENDPOINT should look like https://ik.imagekit.io/your_id (found: "${endpoint}")`);
  }

  if (problems.length > 0) {
    console.error("\nProblems:");
    for (const problem of problems) console.error(` - ${problem}`);
    process.exit(1);
  }
  console.log("\nEverything is connected. Next: npm run db:setup");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
