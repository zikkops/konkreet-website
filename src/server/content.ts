import "server-only";
import { unstable_cache } from "next/cache";
import { localContent, type SiteContent } from "../data/content";
import { db } from "./db";
import { isDatabaseConfigured } from "./env";
import {
  buildSiteContent,
  normalizeSettings,
  rowToProject,
  type ProjectRecord,
  type SiteSettings,
} from "./siteData";

/** Saving anything in the admin panel expires this tag, so the homepage rebuilds with the change. */
export const CONTENT_TAG = "site-content";

/**
 * The built-in content still names the photos that used to sit in
 * public/images. Those now live only on ImageKit, so the fallback drops them
 * rather than pointing at files that aren't there.
 */
const fallbackContent: SiteContent = (() => {
  const content = JSON.parse(JSON.stringify(localContent), (_, value) =>
    typeof value === "string" && value.startsWith("/images/") ? "" : value,
  ) as SiteContent;

  content.projectGroups = content.projectGroups.map((group) => ({
    ...group,
    cards: group.cards.map((card) => ({ ...card, image: card.image || null })),
  }));
  content.profiles = content.profiles.map((profile) => ({
    ...profile,
    gallery: profile.gallery.filter(Boolean),
  }));
  return content;
})();

// Before `npm run db:setup` the tables don't exist yet; treat that as "no content".
async function unlessTablesMissing<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return fallback;
    throw error;
  }
}

export function readSettings(): Promise<SiteSettings | null> {
  return unlessTablesMissing(async () => {
    const rows = await db()`SELECT data FROM site_settings WHERE id = 1`;
    return rows[0] ? normalizeSettings(rows[0].data) : null;
  }, null);
}

export function readProjects(): Promise<ProjectRecord[]> {
  return unlessTablesMissing(async () => {
    const rows = await db()`SELECT * FROM projects ORDER BY position, id`;
    return rows.map(rowToProject);
  }, []);
}

export async function readProject(id: number): Promise<ProjectRecord | null> {
  const rows = await db()`SELECT * FROM projects WHERE id = ${id}`;
  return rows[0] ? rowToProject(rows[0]) : null;
}

// Thrown (rather than returned) so the empty state is never cached.
class NoContentYet extends Error {}

const cachedSiteContent = unstable_cache(
  async () => {
    const [settings, projects] = await Promise.all([readSettings(), readProjects()]);
    if (!settings) throw new NoContentYet();
    return buildSiteContent(settings, projects);
  },
  ["site-content"],
  // Saving in the admin panel refreshes this immediately through the tag. The
  // time limit is a safety net for changes made outside the panel, such as a
  // script writing straight to the database.
  { tags: [CONTENT_TAG], revalidate: 60 },
);

/** What the homepage renders: the database's content, or the built-in text until it has some. */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isDatabaseConfigured) return fallbackContent;
  try {
    return await cachedSiteContent();
  } catch (error) {
    if (error instanceof NoContentYet) return fallbackContent;
    throw error;
  }
}
