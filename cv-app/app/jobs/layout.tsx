import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
