"use client";

import { useActionState } from "react";
import { changePassword, createAdmin, resetPassword } from "../actions";
import { ConfirmSubmit } from "./ConfirmSubmit";
import type { FormResult } from "./types";
import { buttonClass, Field, inputClass, secondaryButtonClass } from "./ui";

function Status({ result }: { result: FormResult }) {
  if (!result) return null;
  return (
    <p role="status" className={`text-[14px] ${result.ok ? "text-green-700" : "text-red-700"}`}>
      {result.message}
    </p>
  );
}

export function CreateAdminForm({ minLength }: { minLength: number }) {
  const [result, action, pending] = useActionState(createAdmin, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name">
        <input name="name" autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="off" className={inputClass} />
      </Field>
      <Field
        label="Password"
        hint={`At least ${minLength} characters. Give it to them privately; they can change it after logging in.`}
      >
        <input
          name="password"
          type="password"
          required
          minLength={minLength}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Adding…" : "Add user"}
        </button>
        <Status result={result} />
      </div>
    </form>
  );
}

/** Gives one user a new password, shown once so it can be passed on. */
export function ResetPasswordForm({ id, email }: { id: number; email: string }) {
  const [result, action, pending] = useActionState(resetPassword, null);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        className={secondaryButtonClass}
        message={`Give ${email} a new password? They'll be logged out everywhere and will need the new one.`}
      >
        {pending ? "Resetting…" : "Reset password"}
      </ConfirmSubmit>
      {result && (
        <p
          role="status"
          className={`text-[13px] ${result.ok ? "font-bold text-green-700" : "text-red-700"}`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [result, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Current password">
        <input name="current" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <Field label="New password" hint={`At least ${minLength} characters.`}>
        <input
          name="next"
          type="password"
          required
          minLength={minLength}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Change password"}
        </button>
        <Status result={result} />
      </div>
    </form>
  );
}
