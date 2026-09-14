import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectEditor } from "@/app/admin/_components/ProjectEditor";
import { PageTitle, secondaryButtonClass } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { readSettings } from "@/server/content";
import { emptyProject, groupOptions } from "@/server/siteData";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string | string[] }>;
}) {
  await requireAdmin();
  const settings = await readSettings();
  if (!settings || settings.groups.length === 0) redirect("/admin/projects");

  const { group } = await searchParams;
  const groupId = settings.groups.find((entry) => entry.id === group)?.id ?? settings.groups[0].id;

  return (
    <>
      <PageTitle
        title="New project"
        action={
          <Link href="/admin/projects" className={secondaryButtonClass}>
            ← All projects
          </Link>
        }
      />
      <ProjectEditor id={null} initial={emptyProject(groupId)} groups={groupOptions(settings)} />
    </>
  );
}
