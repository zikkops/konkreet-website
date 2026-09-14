import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/server/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  // Only the main admin sees the dashboard and the user list; everyone else
  // works straight in Projects.
  const nav =
    admin.role === "super"
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/projects", label: "Projects" },
          { href: "/admin/admins", label: "Users" },
          { href: "/admin/account", label: "My account" },
        ]
      : [
          { href: "/admin/projects", label: "Projects" },
          { href: "/admin/account", label: "My account" },
        ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin/projects" className="text-[14px] font-bold tracking-[0.24em] text-primary">
            KONKREET
          </Link>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap gap-4 text-[13px] font-bold">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-primary hover:text-copper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-[13px]">
            <Link href="/" target="_blank" className="font-bold text-copper hover:underline">
              View site ↗
            </Link>
            <span className="text-ink/60">{admin.name || admin.email}</span>
            <form action={logout}>
              <button type="submit" className="font-bold text-primary hover:text-copper">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
