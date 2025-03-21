-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteRecipes" DROP CONSTRAINT "FavoriteRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteRecipes" DROP CONSTRAINT "FavoriteRecipes_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Recipes" DROP CONSTRAINT "Recipes_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "_InstructionsToRecipes" DROP CONSTRAINT "_InstructionsToRecipes_A_fkey";

-- DropForeignKey
ALTER TABLE "_InstructionsToRecipes" DROP CONSTRAINT "_InstructionsToRecipes_B_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeCategories" DROP CONSTRAINT "_RecipeCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeCategories" DROP CONSTRAINT "_RecipeCategories_B_fkey";
