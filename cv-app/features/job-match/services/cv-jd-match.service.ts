import type { Prisma } from "@prisma/client";

export type MatchJobInput = {
  title: string;
  description?: string | null;
  requirements?: string | null;
  skills?: string[] | string | null;
  experienceLevel?: string | null;
};

export type CvJdMatchResult = {
  overallScore: number;
  keywordMatch: number;
  experienceMatch: number;
  skillsMatch: number;
  details: Prisma.InputJsonObject;
};

const commonWords = new Set([
  "and",
  "are",
  "ban",
  "cac",
  "cho",
  "co",
  "cong",
  "cua",
  "duoc",
  "for",
  "job",
  "la",
  "lam",
  "mot",
  "the",
  "ung",
  "viec",
  "voi",
  "you",
]);

const seniorityKeywords: Record<string, string[]> = {
  INTERN: ["intern", "internship", "thuc tap"],
  JUNIOR: ["junior", "fresher", "entry"],
  MID: ["mid", "middle", "2 nam", "3 nam"],
  SENIOR: ["senior", "5 nam", "lead", "mentor", "architecture"],
  LEAD: ["lead", "principal", "architect", "team lead", "mentoring"],
  MANAGER: ["manager", "quan ly", "leadership", "people management"],
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !commonWords.has(token));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function jsonText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? {});
}

function jobText(job: MatchJobInput) {
  const skills = Array.isArray(job.skills) ? job.skills.join(" ") : job.skills ?? "";
  return [job.title, job.description, job.requirements, skills, job.experienceLevel].filter(Boolean).join(" ");
}

function jobSkills(job: MatchJobInput) {
  const rawSkills = Array.isArray(job.skills) ? job.skills : String(job.skills ?? "").split(",");
  return unique(rawSkills.map((skill) => normalize(skill).trim()).filter(Boolean));
}

export class CvJdMatchService {
  analyze(resumeContent: unknown, job: MatchJobInput): CvJdMatchResult {
    const resume = normalize(jsonText(resumeContent));
    const jd = jobText(job);
    const jdTokens = unique(tokenize(jd)).slice(0, 80);
    const matchedKeywords = jdTokens.filter((token) => resume.includes(token));
    const missingKeywords = jdTokens.filter((token) => !resume.includes(token)).slice(0, 20);
    const requiredSkills = jobSkills(job);
    const matchedSkills = requiredSkills.filter((skill) => resume.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !resume.includes(skill));

    const keywordMatch = jdTokens.length === 0 ? 0 : clampScore((matchedKeywords.length / jdTokens.length) * 100);
    const skillsMatch =
      requiredSkills.length === 0 ? keywordMatch : clampScore((matchedSkills.length / requiredSkills.length) * 100);
    const seniorityTerms = job.experienceLevel ? seniorityKeywords[job.experienceLevel] ?? [] : [];
    const seniorityHits = seniorityTerms.filter((term) => resume.includes(normalize(term)));
    const experienceMatch =
      seniorityTerms.length === 0 ? keywordMatch : clampScore((seniorityHits.length / seniorityTerms.length) * 100);
    const overallScore = clampScore(keywordMatch * 0.35 + skillsMatch * 0.45 + experienceMatch * 0.2);

    return {
      overallScore,
      keywordMatch,
      experienceMatch,
      skillsMatch,
      details: {
        algorithm: "deterministic-cv-jd-v1",
        matchedKeywords: matchedKeywords.slice(0, 20),
        missingKeywords,
        requiredSkills,
        matchedSkills,
        missingSkills,
        evidence: [
          `${matchedKeywords.length}/${jdTokens.length} tu khoa JD xuat hien trong CV snapshot.`,
          `${matchedSkills.length}/${requiredSkills.length} ky nang yeu cau duoc tim thay trong CV snapshot.`,
        ],
        limitations: [
          "Diem phu hop la goi y tu van dua tren CV snapshot va JD da luu.",
          "Heuristic khong thay the viec review CV va bai assessment cua nha tuyen dung.",
        ],
      },
    };
  }
}

export const cvJdMatchService = new CvJdMatchService();
