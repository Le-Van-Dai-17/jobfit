"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateCompanySettingsAction, type CompanyOnboardingState } from "./actions/onboard-company";

type CompanySettingsFormProps = {
  company: {
    name: string;
    website: string | null;
    description?: string | null;
    location: string | null;
  };
};

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const [state, formAction, pending] = useActionState<CompanyOnboardingState, FormData>(
    updateCompanySettingsAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Cai dat cong ty</h2>
      {state.error ? <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Ten cong ty</span>
        <Input name="name" required disabled={pending} defaultValue={company.name} />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Website</span>
        <Input name="website" type="url" disabled={pending} defaultValue={company.website ?? ""} />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Dia diem</span>
        <Input name="location" disabled={pending} defaultValue={company.location ?? ""} />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Mo ta</span>
        <Textarea name="description" disabled={pending} defaultValue={company.description ?? ""} />
      </label>
      <button type="submit" disabled={pending} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white">
        {pending ? "Dang luu..." : "Luu cai dat"}
      </button>
    </form>
  );
}
