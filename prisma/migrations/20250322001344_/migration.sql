/*
  Warnings:

  - You are about to drop the `RecipeInstructions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RecipeInstructions";

-- CreateTable
CREATE TABLE "_InstructionsToRecipes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InstructionsToRecipes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstructionsToRecipes_B_index" ON "_InstructionsToRecipes"("B");
