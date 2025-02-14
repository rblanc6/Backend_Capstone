-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Recipes" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "updatedAt" TIMESTAMP(3);
