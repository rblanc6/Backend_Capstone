/*
  Warnings:

  - You are about to drop the `RecipeInstructions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeInstructions" DROP CONSTRAINT "RecipeInstructions_instructionId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeInstructions" DROP CONSTRAINT "RecipeInstructions_recipeId_fkey";

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

-- AddForeignKey
ALTER TABLE "_InstructionsToRecipes" ADD CONSTRAINT "_InstructionsToRecipes_A_fkey" FOREIGN KEY ("A") REFERENCES "Instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructionsToRecipes" ADD CONSTRAINT "_InstructionsToRecipes_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
