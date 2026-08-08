-- Add password hashes for local credential users. Existing OAuth/demo users remain nullable.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Replace the historical USER role with CANDIDATE while preserving ADMIN.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
CREATE TYPE "UserRole_new" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE
      WHEN "role"::text = 'USER' THEN 'CANDIDATE'
      WHEN "role"::text IN ('CANDIDATE', 'RECRUITER', 'ADMIN') THEN "role"::text
      ELSE 'CANDIDATE'
    END::"UserRole_new"
  );
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CANDIDATE';

CREATE TYPE "CompanyMembershipRole" AS ENUM ('OWNER', 'RECRUITER');

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "website" TEXT,
  "description" TEXT,
  "location" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyMembership" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "role" "CompanyMembershipRole" NOT NULL DEFAULT 'RECRUITER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE INDEX "Company_slug_idx" ON "Company"("slug");
CREATE UNIQUE INDEX "CompanyMembership_userId_companyId_key" ON "CompanyMembership"("userId", "companyId");
CREATE UNIQUE INDEX "CompanyMembership_userId_key" ON "CompanyMembership"("userId");
CREATE INDEX "CompanyMembership_userId_idx" ON "CompanyMembership"("userId");
CREATE INDEX "CompanyMembership_companyId_idx" ON "CompanyMembership"("companyId");

ALTER TABLE "CompanyMembership"
  ADD CONSTRAINT "CompanyMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyMembership"
  ADD CONSTRAINT "CompanyMembership_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
