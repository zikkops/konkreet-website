import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/auth";
import { isDatabaseConfigured } from "@/server/env";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm border-t-[6px] border-copper bg-white p-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-copper">Konkreet</p>
        <h1 className="mt-2 text-[28px] font-bold text-primary">Admin login</h1>
        {isDatabaseConfigured ? (
          <LoginForm />
        ) : (
          <p className="mt-6 text-[14px]">
            The database isn&apos;t connected yet. Set DATABASE_URL in .env.local, run{" "}
            <code>npm run db:setup</code>, and restart the site.
          </p>
        )}
      </div>
    </main>
  );
}
