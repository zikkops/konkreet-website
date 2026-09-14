import Link from "next/link";
import { GroupHeadingsForm } from "@/app/admin/_components/GroupHeadingsForm";
import { ProjectList, type ProjectRow } from "@/app/admin/_components/ProjectList";
import { ProjectSearch, type SearchItem } from "@/app/admin/_components/ProjectSearch";
import { buttonClass, PageTitle, secondaryButtonClass } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { readProjects, readSettings } from "@/server/content";
import type { ProjectRecord } from "@/server/siteData";

// The editor only needs these fields, so only these reach the browser.
const toRow = (project: ProjectRecord): ProjectRow => ({
  id: project.id,
  title: project.title,
  role: project.role,
  coverImage: project.coverImage,
  photos: project.gallery.length,
});

export default async function ProjectsPage() {
  await requireAdmin();
  const [settings, projects] = await Promise.all([readSettings(), readProjects()]);
  const groups = settings?.groups ?? [];
  const groupIds = new Set(groups.map((group) => group.id));
  const ungrouped = projects.filter((project) => !groupIds.has(project.groupId));

  const inGroup = (groupId: string) => projects.filter((project) => project.groupId === groupId);

  const searchItems: SearchItem[] = [
    ...groups.flatMap((group) =>
      inGroup(group.id).map((project) => ({
        id: project.id,
        title: project.title,
        role: project.role,
        group: group.heading || "Untitled group",
      })),
    ),
    ...ungrouped.map((project) => ({
      id: project.id,
      title: project.title,
      role: project.role,
      group: "Not in any group",
    })),
  ];

  return (
    <>
      <PageTitle
        title="Projects"
        description="Add, edit, reorder and remove the projects on the site. Each group's heading and intro can be edited here too."
        action={
          groups.length > 0 && (
            <Link href="/admin/projects/new" className={buttonClass}>
              + New project
            </Link>
          )
        }
      />
      {!settings && (
        <p className="mb-6 border-l-4 border-copper bg-white p-4 text-[14px]">
          The database has no content yet. Run <code>npm run db:setup</code> first.
        </p>
      )}

      {searchItems.length > 4 && <ProjectSearch items={searchItems} />}

      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <section key={group.id}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[22px] font-bold text-primary">{group.heading || "Untitled group"}</h2>
                <p className="text-[13px] text-ink/60">
                  {group.profileHeading
                    ? `Cards, plus full profiles under “${group.profileHeading}”`
                    : "Cards only"}{" "}
                  · {inGroup(group.id).length} projects
                </p>
              </div>
              <Link
                href={`/admin/projects/new?group=${encodeURIComponent(group.id)}`}
                className={secondaryButtonClass}
              >
                + Add to this group
              </Link>
            </div>

            <div className="mb-3">
              <GroupHeadingsForm group={group} />
            </div>

            <ProjectList groupId={group.id} projects={inGroup(group.id).map(toRow)} />
          </section>
        ))}

        {ungrouped.length > 0 && (
          <section>
            <h2 className="text-[22px] font-bold text-primary">Not in any group</h2>
            <p className="mb-3 text-[13px] text-ink/60">
              Hidden from the site. Edit a project to move it into a group.
            </p>
            <ProjectList groupId={null} projects={ungrouped.map(toRow)} />
          </section>
        )}
      </div>
    </>
  );
}
