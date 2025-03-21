/*
  Warnings:

  - You are about to drop the column `recipeId` on the `Instructions` table. All the data in the column will be lost.
  - You are about to drop the `_InstructionsToRecipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Instructions" DROP COLUMN "recipeId";

-- DropTable
DROP TABLE "_InstructionsToRecipes";

-- CreateTable
CREATE TABLE "_RecipeInstructions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipeInstructions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RecipeInstructions_B_index" ON "_RecipeInstructions"("B");
