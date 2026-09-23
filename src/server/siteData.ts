import {
  localContent,
  type Meta,
  type Profile,
  type ProjectGroup,
  type SiteContent,
} from "../data/content";
import { imagekitSized, isImageKitUrl } from "../lib/imageUrl";

// Pure data shaping, shared by the site, the admin panel and the setup script.

export type GroupSettings = {
  id: string;
  heading: string;
  intro: string;
  /** Heading of the band above this group's full profiles; empty means cards only. */
  profileHeading: string;
};

/** Every page section except the projects, which live in their own table. */
export type SiteSettings = Omit<SiteContent, "projectGroups" | "profiles"> & {
  groups: GroupSettings[];
};

/**
 * The project details, in the order they appear. The labels are fixed: the
 * editor fills in values only, and an empty value is left off the site.
 */
export const DETAIL_LABELS = [
  "Role",
  "Lead Oversight",
  "Project Type",
  "Location",
  "Developer",
  "Architect",
] as const;

export type ProjectInput = {
  groupId: string;
  title: string;
  role: string;
  coverImage: string | null;
  description: string;
  meta: Meta[];
  tags: string[];
  gallery: string[];
  /** This project's photos are portrait, so give them taller frames. */
  portrait: boolean;
};

export type ProjectRecord = ProjectInput & { id: number; position: number };

const SEED_GROUP_IDS = ["selected", "ongoing", "additional"];

export const newId = () => globalThis.crypto.randomUUID().slice(0, 8);

export type GroupOption = { id: string; heading: string; hasProfile: boolean };

/** The groups as the project editor's "Group" dropdown lists them. */
export const groupOptions = (settings: SiteSettings): GroupOption[] =>
  settings.groups.map((group) => ({
    id: group.id,
    heading: group.heading || "Untitled group",
    hasProfile: Boolean(group.profileHeading),
  }));

export const emptyProject = (groupId: string): ProjectInput => ({
  groupId,
  title: "",
  role: "",
  coverImage: null,
  description: "",
  meta: DETAIL_LABELS.map((label) => ({ label, value: "" })),
  tags: [],
  gallery: [],
  portrait: false,
});

/** The settings half of the page's content; the projects go through projectsFromContent. */
export function settingsFromContent(content: SiteContent): SiteSettings {
  const { projectGroups, profiles, ...sections } = content;
  return {
    ...sections,
    groups: projectGroups.map((group, index) => ({
      id: SEED_GROUP_IDS[index] ?? `group-${index + 1}`,
      heading: group.heading,
      intro: group.intro,
      profileHeading:
        profiles.find((profile) => group.cards.some((card) => card.title === profile.title))?.group ?? "",
    })),
  };
}

export function projectsFromContent(content: SiteContent, groups: GroupSettings[]): ProjectInput[] {
  return content.projectGroups.flatMap((group, index) =>
    group.cards.map((card) => {
      const profile = content.profiles.find((entry) => entry.title === card.title);
      return {
        groupId: groups[index].id,
        title: card.title,
        role: card.role,
        coverImage: card.image,
        description: profile?.description ?? "",
        meta: profile?.meta ?? [],
        tags: profile?.tags ?? [],
        gallery: profile?.gallery ?? [],
        portrait: false,
      };
    }),
  );
}

/** The shape every settings document is coerced into; also the admin editor's template. */
export const settingsTemplate = settingsFromContent(localContent);

// Photos must come from our ImageKit uploads or the repo's own /images.
const isAllowedImage = (src: string) => isImageKitUrl(src) || src.startsWith("/images/");
const isSafeHref = (href: string) => /^(https?:\/\/|mailto:|tel:|#)/i.test(href);

/**
 * Copies `raw` into the shape of `template`, so a field that's missing or
 * the wrong type renders as "" or [] instead of breaking the page.
 */
function fill<T>(template: T, raw: unknown): T {
  if (typeof template === "string") {
    return (typeof raw === "string" ? raw : "") as T;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(raw)) return [] as T;
    if (template.length === 0) return raw as T;
    // Merge every template item so optional keys (a contact row's href) survive.
    const item = typeof template[0] === "object" ? Object.assign({}, ...template) : template[0];
    return raw.filter((value) => value != null).map((value) => fill(item, value)) as T;
  }
  if (template && typeof template === "object") {
    const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [key, fill(value, source[key])]),
    ) as T;
  }
  return (raw ?? template) as T;
}

/** Coerces untrusted JSON (a form post or a database row) into complete, safe settings. */
export function normalizeSettings(raw: unknown): SiteSettings {
  const settings = fill(settingsTemplate, raw);
  const image = (src: string) => (isAllowedImage(src) ? src : "");

  settings.hero.background = image(settings.hero.background);
  settings.about.primaryImage = image(settings.about.primaryImage);
  settings.about.insetImage = image(settings.about.insetImage);
  settings.closing.background = image(settings.closing.background);
  settings.imageBand = settings.imageBand.map((band) => ({ ...band, src: image(band.src) }));
  settings.contact.rows = settings.contact.rows.map((row) => ({
    ...row,
    href: row.href && isSafeHref(row.href) ? row.href : "",
  }));
  settings.groups = settings.groups.map((group) => ({ ...group, id: group.id || newId() }));
  return settings;
}

/** Coerces untrusted JSON (a form post or a database row) into a safe project. */
export function normalizeProject(raw: unknown): ProjectInput {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (value: unknown) => (typeof value === "string" ? value : "");
  const strings = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const cover = str(source.coverImage);

  // Always the same six details, in the same order, whatever was sent.
  const sent = (Array.isArray(source.meta) ? source.meta : []) as ({ label?: unknown; value?: unknown } | null)[];
  const meta = DETAIL_LABELS.map((label) => {
    const match = sent.find(
      (entry) => typeof entry?.label === "string" && entry.label.trim().toLowerCase() === label.toLowerCase(),
    );
    return { label, value: str(match?.value).trim() };
  });

  return {
    groupId: str(source.groupId),
    title: str(source.title).trim(),
    role: str(source.role),
    coverImage: cover && isAllowedImage(cover) ? cover : null,
    description: str(source.description),
    meta,
    tags: strings(source.tags)
      .map((tag) => tag.trim())
      .filter(Boolean),
    gallery: strings(source.gallery).filter(isAllowedImage),
    portrait: source.portrait === true,
  };
}

export function rowToProject(row: Record<string, unknown>): ProjectRecord {
  return {
    id: Number(row.id),
    position: Number(row.position),
    ...normalizeProject({
      groupId: row.group_id,
      title: row.title,
      role: row.role,
      coverImage: row.cover_image,
      description: row.description,
      meta: row.meta,
      tags: row.tags,
      gallery: row.gallery,
      portrait: row.portrait,
    }),
  };
}

/** "Project 01", "Project 02", … in the order the profiles appear down the page. */
const profileLabel = (number: number) => `Project ${String(number).padStart(2, "0")}`;

/** Assembles what the homepage renders from the settings row and the projects table. */
export function buildSiteContent(settings: SiteSettings, projects: ProjectRecord[]): SiteContent {
  const { groups, ...sections } = settings;
  const projectGroups: ProjectGroup[] = [];
  const profiles: Profile[] = [];

  for (const group of groups) {
    const members = projects
      .filter((project) => project.groupId === group.id)
      .sort((a, b) => a.position - b.position || a.id - b.id);

    projectGroups.push({
      heading: group.heading,
      intro: group.intro,
      cards: members.map((project) => ({
        title: project.title,
        role: project.role,
        image: project.coverImage,
      })),
    });

    if (!group.profileHeading) continue;
    for (const project of members) {
      profiles.push({
        // Numbered automatically, so reordering the projects renumbers them.
        label: profileLabel(profiles.length + 1),
        group: group.profileHeading,
        title: project.title,
        description: project.description,
        // A detail left empty simply isn't shown.
        meta: project.meta.filter((detail) => detail.value),
        tags: project.tags,
        gallery: project.gallery,
        // Left off entirely when false, so the usual landscape frames stay put.
        ...(project.portrait ? { portrait: true } : {}),
      });
    }
  }

  const content: SiteContent = { ...sections, projectGroups, profiles };
  // The hero photo is a CSS background, so it can't go through CmsImage's loader.
  if (isImageKitUrl(content.hero.background)) {
    content.hero = { ...content.hero, background: imagekitSized(content.hero.background, 1920) };
  }
  return content;
}

/** Every string anywhere inside `value` that passes `test`. */
export function collectStrings(value: unknown, test: (text: string) => boolean, into = new Set<string>()) {
  if (typeof value === "string") {
    if (test(value)) into.add(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, test, into);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, test, into);
  }
  return into;
}

export const imageUrlsIn = (value: unknown) => collectStrings(value, isImageKitUrl);
