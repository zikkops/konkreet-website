import { SitePhotosForm } from "@/app/admin/_components/SitePhotosForm";
import { PageTitle } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { readSettings } from "@/server/content";
import { sitePhotosFrom } from "@/server/siteData";

export default async function SitePhotosPage() {
  await requireAdmin();
  const settings = await readSettings();

  return (
    <>
      <PageTitle
        title="Site photos"
        description="The homepage photos that aren't part of a project. Replace one, then save to put it live."
      />
      {settings ? (
        <SitePhotosForm initial={sitePhotosFrom(settings)} />
      ) : (
        <p className="border-l-4 border-copper bg-white p-4 text-[14px]">
          The database has no content yet. Run <code>npm run db:setup</code> to copy the current website into it.
        </p>
      )}
    </>
  );
}
