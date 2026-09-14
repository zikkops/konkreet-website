import { ChangePasswordForm } from "@/app/admin/_components/AdminForms";
import { PageTitle } from "@/app/admin/_components/ui";
import { requireAdmin } from "@/server/auth";
import { MIN_PASSWORD_LENGTH } from "@/server/password";

export default async function AccountPage() {
  const me = await requireAdmin();

  return (
    <>
      <PageTitle title="My account" description="Your login details." />

      <dl className="mb-10 border border-ink/10 bg-white p-5 text-[15px]">
        {[
          { label: "Name", value: me.name || "—" },
          { label: "Email", value: me.email },
          { label: "Access", value: me.role === "super" ? "Main admin (manages users)" : "Can edit projects" },
        ].map((row) => (
          <div key={row.label} className="flex flex-wrap gap-2 not-last:mb-3">
            <dt className="w-[120px] shrink-0 text-[12px] font-bold uppercase tracking-[0.1em] text-copper">
              {row.label}
            </dt>
            <dd className="text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-4 border border-ink/10 bg-white p-5">
        <h2 className="text-[20px] font-bold text-primary">Change your password</h2>
        <ChangePasswordForm minLength={MIN_PASSWORD_LENGTH} />
      </section>
    </>
  );
}
