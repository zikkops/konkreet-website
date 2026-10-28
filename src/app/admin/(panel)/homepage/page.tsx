import { HomepageForm } from "@/app/admin/_components/HomepageForm";
import { PageTitle } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { readSettings } from "@/server/content";
import { pageContentFrom, settingsTemplate } from "@/server/siteData";

export default async function HomepagePage() {
  await requireAdmin();
  const settings = await readSettings();

  return (
    <>
      <PageTitle
        title="Homepage"
        description="All the wording and photos on the homepage, from the top of the page down to the footer. Projects have their own page. Save to put your changes live."
      />
      {settings ? (
        <HomepageForm initial={pageContentFrom(settings)} template={pageContentFrom(settingsTemplate)} />
      ) : (
        <p className="border-l-4 border-copper bg-white p-4 text-[14px]">
          The database has no content yet. Run <code>npm run db:setup</code> to copy the current website into it.
        </p>
      )}
    </>
  );
}
