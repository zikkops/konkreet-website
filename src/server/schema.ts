// Every statement is idempotent, so `npm run db:setup` can be re-run safely.
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS admins (
    id serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    name text NOT NULL DEFAULT '',
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  // Everyone is a normal admin unless promoted to "super", who alone manages accounts.
  `ALTER TABLE admins ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin'`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash text PRIMARY KEY,
    admin_id integer NOT NULL REFERENCES admins (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_failures (
    email text NOT NULL,
    failed_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS login_failures_email ON login_failures (email, failed_at)`,
  // A single row holding every page section except the projects.
  `CREATE TABLE IF NOT EXISTS site_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id serial PRIMARY KEY,
    group_id text NOT NULL,
    position integer NOT NULL DEFAULT 0,
    title text NOT NULL,
    role text NOT NULL DEFAULT '',
    cover_image text,
    label text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    meta jsonb NOT NULL DEFAULT '[]',
    tags jsonb NOT NULL DEFAULT '[]',
    gallery jsonb NOT NULL DEFAULT '[]',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
];
