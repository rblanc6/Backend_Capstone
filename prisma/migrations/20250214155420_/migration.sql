/*
  Warnings:

  - Added the required column `id` to the `FavoriteRecipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FavoriteRecipes" ADD COLUMN     "id" INTEGER NOT NULL;
