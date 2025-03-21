/*
  Warnings:

  - You are about to drop the `_RecipeInstructions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "_RecipeInstructions";

-- CreateTable
CREATE TABLE "RecipeInstructions" (
    "instructionId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "RecipeInstructions_pkey" PRIMARY KEY ("instructionId","recipeId")
);
