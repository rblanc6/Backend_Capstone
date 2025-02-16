/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipes" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "_RecipeCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipeCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RecipeCategories_B_index" ON "_RecipeCategories"("B");
