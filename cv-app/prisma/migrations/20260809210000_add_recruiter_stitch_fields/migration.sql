-- Add only nullable/defaulted structured fields required by the downloaded Recruiter UI.
CREATE TYPE "CompanyIndustry" AS ENUM ('INFORMATION_TECHNOLOGY', 'SOFTWARE', 'FINANCE_BANKING', 'ECOMMERCE', 'EDUCATION', 'HEALTHCARE', 'MANUFACTURING', 'PROFESSIONAL_SERVICES', 'OTHER');
CREATE TYPE "CompanySize" AS ENUM ('SIZE_1_9', 'SIZE_10_49', 'SIZE_50_99', 'SIZE_100_499', 'SIZE_500_999', 'SIZE_1000_PLUS');
CREATE TYPE "JobDepartment" AS ENUM ('ENGINEERING', 'PRODUCT', 'DESIGN', 'DATA', 'MARKETING', 'SALES', 'OPERATIONS', 'HUMAN_RESOURCES', 'FINANCE', 'OTHER');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');
CREATE TYPE "ExperienceLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER');

ALTER TABLE "Company"
  ADD COLUMN "industry" "CompanyIndustry",
  ADD COLUMN "size" "CompanySize";

ALTER TABLE "Job"
  ADD COLUMN "department" "JobDepartment",
  ADD COLUMN "employmentType" "EmploymentType",
  ADD COLUMN "workMode" "WorkMode",
  ADD COLUMN "experienceLevel" "ExperienceLevel",
  ADD COLUMN "salaryMin" INTEGER,
  ADD COLUMN "salaryMax" INTEGER,
  ADD COLUMN "salaryCurrency" TEXT DEFAULT 'VND',
  ADD COLUMN "salaryNegotiable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "benefits" TEXT;
