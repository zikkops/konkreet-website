/**
 * Prepares the database: creates the tables, then (only if there's no
 * content yet) uploads the site's current photos to ImageKit and copies the
 * text from src/data/content.ts, so the admin panel starts with today's site.
 *
 *   npm run db:setup
 *
 * Safe to re-run: existing content is never overwritten.
 */
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { localContent } from "../src/data/content";
import { db, insertProject, upsertSettings } from "../src/server/db";
import { uploadImage } from "../src/server/imagekit";
import { SCHEMA } from "../src/server/schema";
import { collectStrings, projectsFromContent, settingsFromContent } from "../src/server/siteData";

const UPLOAD_CONCURRENCY = 4;
const publicDir = path.join(process.cwd(), "public");

/**
 * "/images/projects/iglu/01.webp" → "projects-iglu-01.webp". ImageKit file
 * names allow letters, digits, dots and dashes, so the folders in the path
 * become part of the name and keep it unique.
 */
const fileNameFor = (src: string) => src.replace(/^\/images\//, "").replace(/[^\w.-]+/g, "-");

async function uploadAll(sources: string[]) {
  const urls = new Map<string, string>();
  const queue = [...sources];
  let done = 0;

  async function worker() {
    for (let src = queue.shift(); src; src = queue.shift()) {
      const fullPath = path.join(publicDir, src);
      // The photos now live on ImageKit; public/images was deleted once they were up.
      if (!existsSync(fullPath)) {
        console.log(`  [${++done}/${sources.length}] skipped, not on disk: ${src}`);
        continue;
      }
      urls.set(src, await uploadImage(createReadStream(fullPath), fileNameFor(src)));
      console.log(`  [${++done}/${sources.length}] ${src}`);
    }
  }

  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
  return urls;
}

async function main() {
  const sql = db();
  for (const statement of SCHEMA) await sql.query(statement);
  console.log("Tables are ready.");

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM site_settings`;
  if (count > 0) {
    console.log("The database already has content, so it was left as it is.");
    return;
  }

  const settings = settingsFromContent(localContent);
  const projects = projectsFromContent(localContent, settings.groups);
  const sources = [...collectStrings([settings, projects], (text) => text.startsWith("/images/"))];

  console.log(`Uploading ${sources.length} photos to ImageKit…`);
  const urls = await uploadAll(sources);
  // Swap every /images/... path for its ImageKit URL.
  const withUrls = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value), (_, item) =>
      typeof item === "string" && urls.has(item) ? urls.get(item) : item,
    );

  const positions = new Map<string, number>();
  const nextPosition = (groupId: string) => {
    const position = positions.get(groupId) ?? 0;
    positions.set(groupId, position + 1);
    return position;
  };

  await sql.transaction([
    upsertSettings(sql, withUrls(settings)),
    ...withUrls(projects).map((project) => insertProject(sql, project, nextPosition(project.groupId))),
  ]);

  console.log(`Saved the page content and ${projects.length} projects.`);
  console.log('Next: npm run admin:create -- you@example.com "Your Name"');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
