/*
  Warnings:

  - Added the required column `updatedAt` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Recipes" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
