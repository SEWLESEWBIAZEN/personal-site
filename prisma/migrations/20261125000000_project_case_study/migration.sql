-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('CONCEPT', 'PROTOTYPE', 'IN_DEVELOPMENT', 'PILOT', 'PRODUCTION', 'MAINTAINED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "outcomes" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "stage" "ProjectStage";

