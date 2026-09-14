"use server";

import { randomBytes } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  attemptLogin,
  endAllSessions,
  endOtherSessions,
  endSession,
  requireAdmin,
  requireSuperAdmin,
} from "@/server/auth";
import { CONTENT_TAG, readProject, readProjects, readSettings } from "@/server/content";
import { db, insertProject, updateProject, upsertSettings } from "@/server/db";
import { deleteImages } from "@/server/imagekit";
import { uploadSignature } from "@/server/imagekitAuth";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/server/password";
import { imageUrlsIn, normalizeProject, normalizeSettings } from "@/server/siteData";
import type { FormResult } from "./_components/types";

// Every action checks the login itself: an action is reachable by a direct
// POST, whatever page it's used on.

function parseJson(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return null;
  }
}

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

/** Deletes the photos `previous` used that nothing on the site uses any more. */
async function deleteOrphanedImages(previous: unknown) {
  try {
    const [settings, projects] = await Promise.all([readSettings(), readProjects()]);
    const inUse = imageUrlsIn([settings, projects]);
    await deleteImages([...imageUrlsIn(previous)].filter((url) => !inUse.has(url)));
  } catch (error) {
    console.error("Couldn't clean up unused photos:", error);
  }
}

// ── Login ────────────────────────────────────────────────────────────────

export async function login(_: FormResult, formData: FormData): Promise<FormResult> {
  const result = await attemptLogin(field(formData, "email"), String(formData.get("password") ?? ""));
  if (result === "locked") {
    return { ok: false, message: "Too many failed attempts. Try again in 15 minutes." };
  }
  if (result === "invalid") return { ok: false, message: "Wrong email or password." };
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ── Photos ───────────────────────────────────────────────────────────────

export async function getUploadSignature() {
  await requireAdmin();
  return uploadSignature();
}

// ── Projects ─────────────────────────────────────────────────────────────

async function nextPosition(groupId: string) {
  const [row] = await db()`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM projects
    WHERE group_id = ${groupId}`;
  return Number(row.next);
}

export async function saveProject(_: FormResult, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const project = normalizeProject(parseJson(formData.get("data")));
  if (!project.title) return { ok: false, message: "Give the project a title." };

  const settings = await readSettings();
  if (!settings?.groups.some((group) => group.id === project.groupId)) {
    return { ok: false, message: "Choose which group the project belongs to." };
  }

  const previous = id ? await readProject(id) : null;
  if (id && !previous) return { ok: false, message: "This project was deleted in the meantime." };

  // New projects, and projects moved to another group, go to the end of that group.
  const position =
    previous && previous.groupId === project.groupId
      ? previous.position
      : await nextPosition(project.groupId);

  if (previous) {
    await updateProject(db(), previous.id, project, position);
    await deleteOrphanedImages(previous);
  } else {
    await insertProject(db(), project, position);
  }

  updateTag(CONTENT_TAG);
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const project = await readProject(Number(formData.get("id")));
  if (!project) return;

  await db()`DELETE FROM projects WHERE id = ${project.id}`;
  await deleteOrphanedImages(project);
  updateTag(CONTENT_TAG);
  refresh();
}

export async function moveProject(formData: FormData) {
  await requireAdmin();
  const project = await readProject(Number(formData.get("id")));
  if (!project) return;

  const step = formData.get("direction") === "up" ? -1 : 1;
  const siblings = (await readProjects()).filter((entry) => entry.groupId === project.groupId);
  const index = siblings.findIndex((entry) => entry.id === project.id);
  const other = siblings[index + step];
  if (!other) return;

  // Renumber the whole group, so duplicate positions can't turn the swap into a no-op.
  siblings[index] = other;
  siblings[index + step] = project;
  const sql = db();
  await sql.transaction(
    siblings.map((entry, position) => sql`UPDATE projects SET position = ${position} WHERE id = ${entry.id}`),
  );
  updateTag(CONTENT_TAG);
  refresh();
}

/** The heading, intro and profile band heading shown above one group of projects. */
export async function saveGroup(_: FormResult, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const settings = await readSettings();
  if (!settings) return { ok: false, message: "There's no page content yet." };

  const group = settings.groups.find((entry) => entry.id === field(formData, "groupId"));
  if (!group) return { ok: false, message: "That group no longer exists." };

  group.heading = field(formData, "heading");
  group.intro = field(formData, "intro");
  group.profileHeading = field(formData, "profileHeading");

  await upsertSettings(db(), normalizeSettings(settings));
  updateTag(CONTENT_TAG);
  refresh();
  return { ok: true, message: "Saved." };
}

/** Stores a whole group's order after the projects were dragged around. */
export async function reorderProjects(formData: FormData) {
  await requireAdmin();
  const groupId = field(formData, "groupId");
  const ids = String(formData.get("order") ?? "")
    .split(",")
    .map(Number)
    .filter(Number.isInteger);

  const inGroup = (await readProjects()).filter((project) => project.groupId === groupId);
  const known = new Set(inGroup.map((project) => project.id));
  // Ignore a list that no longer matches the group, e.g. after someone else edited it.
  if (ids.length !== known.size || !ids.every((id) => known.has(id))) return;

  const sql = db();
  await sql.transaction(
    ids.map((id, position) => sql`UPDATE projects SET position = ${position} WHERE id = ${id}`),
  );
  updateTag(CONTENT_TAG);
  refresh();
}

// ── Accounts ─────────────────────────────────────────────────────────────
// Only the main (super) admin manages other people. Nothing here can change
// anyone's access level, so the main admin can't be demoted or removed.

const newPassword = () => randomBytes(12).toString("base64url");

export async function createAdmin(_: FormResult, formData: FormData): Promise<FormResult> {
  await requireSuperAdmin();
  const email = field(formData, "email").toLowerCase();
  const name = field(formData, "name");
  const password = String(formData.get("password") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `The password needs at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const rows = await db()`INSERT INTO admins (email, name, password_hash, role)
    VALUES (${email}, ${name}, ${await hashPassword(password)}, 'admin')
    ON CONFLICT (email) DO NOTHING RETURNING id`;
  if (rows.length === 0) return { ok: false, message: "There's already a user with that email." };

  refresh();
  return { ok: true, message: `${email} can now log in.` };
}

/** Gives one user a new password and shows it once, for the main admin to pass on. */
export async function resetPassword(_: FormResult, formData: FormData): Promise<FormResult> {
  await requireSuperAdmin();
  const id = Number(formData.get("id"));
  const [target] = await db()`SELECT id, email, role FROM admins WHERE id = ${id}`;
  if (!target) return { ok: false, message: "That user no longer exists." };
  if (target.role === "super") {
    return { ok: false, message: "Change the main admin's password under My account." };
  }

  const password = newPassword();
  await db()`UPDATE admins SET password_hash = ${await hashPassword(password)} WHERE id = ${target.id}`;
  await endAllSessions(Number(target.id));

  refresh();
  return { ok: true, message: `New password for ${target.email}: ${password}` };
}

export async function deleteAdmin(formData: FormData) {
  const me = await requireSuperAdmin();
  const id = Number(formData.get("id"));
  if (!id || id === me.id) return;
  // The main admin can never be removed, and the last account always stays.
  await db()`DELETE FROM admins
    WHERE id = ${id} AND role <> 'super' AND (SELECT count(*) FROM admins) > 1`;
  refresh();
}

/** Anyone can change their own password; nobody else's. */
export async function changePassword(_: FormResult, formData: FormData): Promise<FormResult> {
  const me = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  const [row] = await db()`SELECT password_hash FROM admins WHERE id = ${me.id}`;
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return { ok: false, message: "Your current password is wrong." };
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `The new password needs at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  await db()`UPDATE admins SET password_hash = ${await hashPassword(next)} WHERE id = ${me.id}`;
  await endOtherSessions(me.id);
  return { ok: true, message: "Password changed. Any other devices have been logged out." };
}
