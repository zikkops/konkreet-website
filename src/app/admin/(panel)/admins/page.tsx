import { redirect } from "next/navigation";
import { deleteAdmin } from "@/app/admin/actions";
import { CreateAdminForm, ResetPasswordForm } from "@/app/admin/_components/AdminForms";
import { ConfirmSubmit } from "@/app/admin/_components/ConfirmSubmit";
import { dangerButtonClass, PageTitle } from "@/app/admin/_components/ui";
import { listAdmins, requireAdmin } from "@/server/auth";
import { MIN_PASSWORD_LENGTH } from "@/server/password";

export default async function AdminsPage() {
  const me = await requireAdmin();
  if (me.role !== "super") redirect("/admin/projects");
  const admins = await listAdmins();

  return (
    <>
      <PageTitle
        title="Users"
        description="Who can log in to this panel. Only you can add or remove people and reset their passwords."
      />

      <ul className="mb-10 divide-y divide-ink/10 border border-ink/10 bg-white">
        {admins.map((admin) => (
          <li key={admin.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-primary">
                {admin.name || admin.email}
                {admin.role === "super" && (
                  <span className="ml-2 bg-primary/12 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Main admin
                  </span>
                )}
              </p>
              <p className="text-[13px] text-ink/60">
                {admin.email} · added {new Date(admin.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>

            {admin.role === "super" ? (
              <span className="text-[13px] text-ink/60">
                {admin.id === me.id ? "You · can't be removed" : "Can't be removed"}
              </span>
            ) : (
              <div className="flex flex-wrap items-start gap-2">
                <ResetPasswordForm id={admin.id} email={admin.email} />
                <form action={deleteAdmin}>
                  <input type="hidden" name="id" value={admin.id} />
                  <ConfirmSubmit
                    className={dangerButtonClass}
                    message={`Remove ${admin.email}? They'll be logged out straight away.`}
                  >
                    Remove
                  </ConfirmSubmit>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-4 border border-ink/10 bg-white p-5">
        <div>
          <h2 className="text-[20px] font-bold text-primary">Add a user</h2>
          <p className="mt-1 text-[13px] text-ink/60">
            They can edit projects, but never see this page. Change your own password under My account.
          </p>
        </div>
        <CreateAdminForm minLength={MIN_PASSWORD_LENGTH} />
      </section>
    </>
  );
}
