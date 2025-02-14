/*
  Warnings:

  - Added the required column `creatorId` to the `Recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipes" ADD COLUMN     "creatorId" TEXT NOT NULL;
