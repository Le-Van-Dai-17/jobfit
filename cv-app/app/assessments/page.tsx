import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

export default async function AssessmentsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7">
        <p className="text-sm font-semibold text-primary">Đánh giá kỹ thuật</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Luồng tự làm bài test đã được tắt</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
          Ứng viên không cần tự tạo hoặc tự làm bài test trong quá trình nộp CV. Sau khi bạn ứng tuyển, nhà tuyển dụng sẽ xem hồ sơ và chủ động mời phỏng vấn hoặc làm bài đánh giá trực tiếp nếu phù hợp.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/applications" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Xem đơn ứng tuyển
          </Link>
          <Link href="/jobs" className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low">
            Tìm việc làm
          </Link>
        </div>
      </section>
    </div>
  );
}
