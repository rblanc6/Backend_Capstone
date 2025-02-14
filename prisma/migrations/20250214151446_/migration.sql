/*
  Warnings:

  - You are about to drop the column `favorite` on the `Recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipes" DROP COLUMN "favorite";

-- CreateTable
CREATE TABLE "FavoriteRecipes" (
    "userId" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteRecipes_pkey" PRIMARY KEY ("userId","recipeId")
);
