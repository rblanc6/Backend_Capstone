/*
  Warnings:

  - You are about to drop the column `recipeId` on the `Instructions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Instructions" DROP COLUMN "recipeId";

-- CreateTable
CREATE TABLE "_InstructionsToRecipes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InstructionsToRecipes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstructionsToRecipes_B_index" ON "_InstructionsToRecipes"("B");
