-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructions" (
    "id" SERIAL NOT NULL,
    "instruction" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "Instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Units" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteRecipes" (
    "userId" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteRecipes_pkey" PRIMARY KEY ("userId","recipeId")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" SERIAL NOT NULL,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecipeCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipeCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_userId_recipeId_key" ON "Reviews"("userId", "recipeId");

-- CreateIndex
CREATE INDEX "_RecipeCategories_B_index" ON "_RecipeCategories"("B");
