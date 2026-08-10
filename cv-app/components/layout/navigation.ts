import type { UserRole } from "@prisma/client";
import {
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  UserRound,
  Users,
  Trophy,
} from "lucide-react";

export type AppNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const candidateNavItems: AppNavItem[] = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hồ sơ & CV", href: "/my-cv", icon: FileText },
  { name: "Việc làm", href: "/jobs", icon: Briefcase },
  { name: "Ứng tuyển", href: "/applications", icon: ClipboardCheck },
];

const recruiterNavItems: AppNavItem[] = [
  { name: "Tổng quan", href: "/recruiter", icon: LayoutDashboard },
  { name: "Vị trí tuyển dụng", href: "/recruiter/jobs", icon: Briefcase },
  { name: "Ứng viên", href: "/recruiter/candidates", icon: Users },
  { name: "Bảng xếp hạng", href: "/recruiter/leaderboard", icon: Trophy },
  { name: "Đánh giá", href: "/recruiter/assessments", icon: ClipboardCheck },
  { name: "Công ty", href: "/recruiter/company", icon: Building2 },
];

const adminNavItems: AppNavItem[] = [
  { name: "Quản trị", href: "/admin", icon: UserRound },
];

export function getNavItemsForRole(role: UserRole | undefined): AppNavItem[] {
  if (role === "CANDIDATE") return candidateNavItems;
  if (role === "RECRUITER") return recruiterNavItems;
  if (role === "ADMIN") return adminNavItems;
  return [];
}
