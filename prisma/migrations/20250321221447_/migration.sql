/*
  Warnings:

  - You are about to drop the `_InstructionsToRecipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "_InstructionsToRecipes";

-- CreateTable
CREATE TABLE "RecipeInstructions" (
    "recipeId" INTEGER NOT NULL,
    "instructionId" INTEGER NOT NULL,

    CONSTRAINT "RecipeInstructions_pkey" PRIMARY KEY ("recipeId","instructionId")
);
