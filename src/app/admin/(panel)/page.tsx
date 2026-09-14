import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle } from "@/app/admin/_components/ui";
import { listAdmins, requireAdmin } from "@/server/auth";
import { readProjects, readSettings } from "@/server/content";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  // Everyone except the main admin works straight in Projects.
  if (admin.role !== "super") redirect("/admin/projects");

  const [settings, projects, admins] = await Promise.all([
    readSettings(),
    readProjects(),
    listAdmins(),
  ]);

  const cards = [
    {
      href: "/admin/projects",
      title: "Projects",
      body: `${projects.length} projects. Add, edit, reorder or remove them, with their photos and group headings.`,
    },
    {
      href: "/admin/admins",
      title: "Users",
      body: `${admins.length} can log in. Add people, remove them, or reset a password.`,
    },
    { href: "/admin/account", title: "My account", body: "Change your own password." },
  ];

  return (
    <>
      <PageTitle
        title={`Hello${admin.name ? `, ${admin.name}` : ""}`}
        description="Anything you save here goes live on the website straight away."
      />
      {!settings && (
        <p className="mb-6 border-l-4 border-copper bg-white p-4 text-[14px]">
          The database has no content yet. Run <code>npm run db:setup</code> to copy the current
          website into it.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col gap-2 border-t-[6px] border-copper bg-white p-6 transition-shadow hover:shadow-md"
            >
              <span className="text-[20px] font-bold text-primary">{card.title}</span>
              <span className="text-[14px] text-ink/70">{card.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
