import type { Prisma } from "@prisma/client";
import { FileText, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { resumeService } from "@/features/cv/services/resume.service";
import { CreateResumeForm } from "@/features/my-cv/CreateResumeForm";
import { ImportResumeForm } from "@/features/my-cv/ImportResumeForm";
import MyCvClient from "@/features/my-cv/my-cvClient";
import { profileService } from "@/features/profile/services/profile.service";

export default async function MyCvPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: selectedCvId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const principal = await requireActiveRole(session.user, "CANDIDATE");
  if (!principal) redirect(session.user.role === "CANDIDATE" ? "/login" : getDashboardPathForRole(session.user.role));

  const [resumes, profile] = await Promise.all([resumeService.getUserResumes(principal.id), profileService.getCandidateProfile(principal.id)]);
  const resume = resumes.find(r => r.id === selectedCvId) || resumes[0];
  const latestVersion = resume?.versions?.[0];
  const initialData = latestVersion?.content && typeof latestVersion.content === "object" && !Array.isArray(latestVersion.content) ? latestVersion.content as Prisma.JsonObject : null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm font-semibold text-primary">Hồ sơ & CV</p><h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{profile?.user.name ?? "Ứng viên"}</h1>{profile?.headline ? <p className="mt-1 text-sm text-text-muted">{profile.headline}</p> : <p className="mt-1 text-sm text-text-muted">Chưa có chức danh hồ sơ.</p>}</div><Link href="/profile" className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low"><UserRound className="h-4 w-4" />Cập nhật hồ sơ</Link></div></section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card"><div className="flex items-center justify-between"><div><h2 className="font-bold text-foreground">CV đã lưu</h2><p className="mt-1 text-sm text-text-muted">Mỗi lần lưu tạo một phiên bản snapshot mới.</p></div><span className="rounded-full bg-surface-container px-3 py-1 text-sm font-semibold text-primary">{resumes.length} CV</span></div>{resumes.length > 0 ? <div className="mt-4 grid gap-3 md:grid-cols-2">{resumes.map((item) => <Link href={`/my-cv?id=${item.id}`} key={item.id} className="block"><article className={`rounded-xl border p-4 transition-colors hover:border-primary/50 ${item.id === resume?.id ? "border-primary bg-primary-fixed/40" : "border-outline-variant bg-surface-white"}`}><div className="flex items-start gap-3"><FileText className="h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-sm text-text-muted">Phiên bản mới nhất: {item.versions[0]?.version ?? "chưa có"}</p>{item.id === resume?.id ? <p className="mt-2 text-xs font-semibold text-primary">Đang mở trong trình chỉnh sửa</p> : null}</div></div></article></Link>)}</div> : <p className="mt-4 rounded-lg bg-surface-low p-4 text-sm text-text-muted">Bạn chưa có CV nào.</p>}</section>

      {resume ? (
        <>
          <ImportResumeForm />
          <MyCvClient initialResumeId={resume.id} initialTitle={resume.title} initialData={initialData} />
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <CreateResumeForm />
          <ImportResumeForm />
        </div>
      )}
    </div>
  );
}
