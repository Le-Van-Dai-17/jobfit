import type { UserRole } from "@prisma/client";

const publicRoutes = new Set(["/", "/login", "/register", "/jobs"]);

export function getDashboardPathForRole(role: UserRole) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/dashboard";
}

export function getRequiredRoleRedirect({
  user,
  requiredRole,
}: {
  user: { id?: string; role: UserRole } | null | undefined;
  requiredRole: UserRole;
}) {
  if (!user?.id) return "/login";
  if (user.role !== requiredRole) return getDashboardPathForRole(user.role);
  return null;
}

export function getRouteDecision({
  pathname,
  user,
}: {
  pathname: string;
  user: { id: string; role: UserRole } | null;
}): { allow: true } | { redirectTo: string } {
  if (!user) {
    if (publicRoutes.has(pathname) || pathname.startsWith("/jobs/")) {
      return { allow: true };
    }
    return { redirectTo: "/login" };
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return { redirectTo: getDashboardPathForRole(user.role) };
  }

  if (pathname.startsWith("/recruiter") && user.role !== "RECRUITER") {
    return { redirectTo: getDashboardPathForRole(user.role) };
  }

  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return { redirectTo: getDashboardPathForRole(user.role) };
  }

  if (
    [
      "/dashboard",
      "/profile",
      "/my-cv",
      "/applications",
      "/assessments",
      "/job-match",
      "/job-optimization",
      "/interview",
      "/tracker",
    ].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) &&
    user.role !== "CANDIDATE"
  ) {
    return { redirectTo: getDashboardPathForRole(user.role) };
  }

  return { allow: true };
}
