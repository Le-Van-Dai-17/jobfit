"use client";

import { useActionState } from "react";
import { FilePlus2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createResumeAction } from "./actions/create-resume";

export function CreateResumeForm() {
  const [state, formAction, pending] = useActionState(createResumeAction, {});

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border-light bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white"><FilePlus2 className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tạo CV đầu tiên</h1>
          <p className="text-sm text-text-muted">Đặt tên dễ nhận biết, sau đó nhập nội dung CV của bạn.</p>
        </div>
      </div>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Tên CV</span>
        <Input name="title" required minLength={2} maxLength={120} placeholder="Ví dụ: CV Backend tháng 8" />
      </label>
      {state.error ? <p className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70">
        {pending ? "Đang tạo..." : "Tạo CV"}
      </button>
    </form>
  );
}
