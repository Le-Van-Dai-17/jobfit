"use client";

import { useActionState } from "react";

import { createRecruiterJobAction, type RecruiterActionState } from "../actions/recruiter.actions";

const initialState: RecruiterActionState = {};

export function RecruiterJobForm() {
  const [state, formAction, pending] = useActionState(createRecruiterJobAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border-light bg-white p-5">
      {state.error ? (
        <p role="alert" className="rounded-xl border border-error/30 bg-error-container px-3 py-2 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      {[
        ["title", "Ten vi tri"],
        ["location", "Dia diem"],
        ["type", "Hinh thuc"],
        ["salaryRange", "Luong"],
        ["url", "Link JD"],
      ].map(([name, label]) => (
        <label key={name} className="block text-sm font-medium">
          {label}
          <input name={name} className="mt-1 w-full rounded-xl border border-border-light px-3 py-2" />
        </label>
      ))}
      <label className="block text-sm font-medium">
        Mo ta
        <textarea name="description" className="mt-1 min-h-32 w-full rounded-xl border border-border-light px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Yeu cau
        <textarea name="requirements" className="mt-1 min-h-32 w-full rounded-xl border border-border-light px-3 py-2" />
      </label>
      <button disabled={pending} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Dang luu" : "Luu ban nhap"}
      </button>
    </form>
  );
}
