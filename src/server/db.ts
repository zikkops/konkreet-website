import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { databaseUrl } from "./env";
import type { ProjectInput } from "./siteData";

// Rows come back as plain objects (not arrays, not full result metadata).
type Sql = NeonQueryFunction<false, false>;

let client: Sql | null = null;

/** Neon's query function. Each query is one HTTPS request, so there's no connection pool to manage. */
export function db(): Sql {
  if (!databaseUrl) throw new Error("DATABASE_URL isn't set.");
  client ??= neon(databaseUrl, { arrayMode: false, fullResults: false });
  return client;
}

const json = (value: unknown) => JSON.stringify(value);

// Shared by the admin panel and the setup script. They return the query
// unsent, so they can also go into sql.transaction([...]).
// The profile label isn't stored: it's numbered from the running order.

export const insertProject = (sql: Sql, project: ProjectInput, position: number) => sql`
  INSERT INTO projects (group_id, position, title, role, cover_image, description, meta, tags, gallery)
  VALUES (${project.groupId}, ${position}, ${project.title}, ${project.role}, ${project.coverImage},
    ${project.description}, ${json(project.meta)}::jsonb, ${json(project.tags)}::jsonb,
    ${json(project.gallery)}::jsonb)`;

export const updateProject = (sql: Sql, id: number, project: ProjectInput, position: number) => sql`
  UPDATE projects SET group_id = ${project.groupId}, position = ${position}, title = ${project.title},
    role = ${project.role}, cover_image = ${project.coverImage},
    description = ${project.description}, meta = ${json(project.meta)}::jsonb,
    tags = ${json(project.tags)}::jsonb, gallery = ${json(project.gallery)}::jsonb, updated_at = now()
  WHERE id = ${id}`;

export const upsertSettings = (sql: Sql, settings: unknown) => sql`
  INSERT INTO site_settings (id, data) VALUES (1, ${json(settings)}::jsonb)
  ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
