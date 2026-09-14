import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/app/admin/_components/ProjectEditor";
import { PageTitle, secondaryButtonClass } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { readProject, readSettings } from "@/server/content";
import { groupOptions } from "@/server/siteData";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [project, settings] = await Promise.all([readProject(id), readSettings()]);
  if (!project || !settings) notFound();

  return (
    <>
      <PageTitle
        title={`Edit “${project.title.replace(/\s+/g, " ")}”`}
        action={
          <Link href="/admin/projects" className={secondaryButtonClass}>
            ← All projects
          </Link>
        }
      />
      <ProjectEditor id={project.id} initial={project} groups={groupOptions(settings)} />
    </>
  );
}
