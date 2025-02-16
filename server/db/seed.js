const db = require("../db/index");
const { faker } = require("@faker-js/faker");
const { prisma } = require("../db/common");
require("dotenv").config();
const uuid = require("uuid");

async function seed() {
  console.log("Seeding the database.");
  try {
    await db.query(
      "DROP TABLE IF EXISTS users, categories, ingredients, units, instructions, recipes, reviews, comments, recipeingredient;"
    );

    // Add Users, collect their ID's.
    const users = await Promise.all(
      [...Array(100)].map(() =>
        prisma.users.create({
          data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
          },
        })
      )
    );
    const userIds = users.map((user) => user.id);

    // Add Categories, collect their ID's.
    const categories = await Promise.all(
      [...Array(25)].map(() =>
        prisma.categories.create({
          data: {
            name: faker.food.ethnicCategory(),
          },
        })
      )
    );
    const categoryIds = categories.map((category) => category.id);

    // Add Ingredients
    const ingredients = await Promise.all(
      [...Array(50)].map(() =>
        prisma.ingredients.create({
          data: {
            name: faker.food.ingredient(),
          },
        })
      )
    );
    const ingredientIds = ingredients.map((ingredient) => ingredient.id);

    // Add Units
    const units = await Promise.all(
      [
        "grams",
        "gallons",
        "quarts",
        "pint",
        "liters",
        "pounds",
        "cups",
        "tablespoons",
        "teaspoons",
        "ml",
        "oz",
        "kg",
        "mg",
      ].map((unitName) =>
        prisma.units.create({
          data: {
            name: unitName,
          },
        })
      )
    );
    const unitIds = units.map((unit) => unit.id);

    //Add Instructions, collect their ID's
    const instructions = await Promise.all(
      [...Array(8)].map((_, i) =>
        prisma.instructions.create({
          data: {
            instruction: faker.food.description(),
          },
        })
      )
    );
    const instructionIds = instructions.map((instructions) => instructions.id);

    // Add Recipes, collect their ID's.
    const recipes = await Promise.all(
      [...Array(100)].map((_, i) =>
        prisma.recipes.create({
          data: {
            name: faker.food.dish(),
            description: faker.food.description(),
            instructions: {
              connect: {
                id: instructionIds[
                  Math.floor(Math.random() * instructionIds.length)
                ],
              },
            },
            photo: faker.image.url(),
            categories: {
              connect: {
                id: categoryIds[Math.floor(Math.random() * categoryIds.length)],
              },
            },
            user: {
              connect: {
                id: userIds[Math.floor(Math.random() * userIds.length)],
              },
            },
          },
        })
      )
    );
    const recipeIds = recipes.map((recipe) => recipe.id);

    // Add Reviews, collect their ID's.
    const reviews = await Promise.all(
      [...Array(50)].map(async (_, i) => {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const recipeId =
          recipeIds[Math.floor(Math.random() * recipeIds.length)];

        // Check if the user has already reviewed this recipe
        const existingReview = await prisma.reviews.findFirst({
          where: {
            userId: userId,
            recipeId: recipeId,
          },
        });

        if (!existingReview) {
          // If no existing review, create the new review
          return prisma.reviews.create({
            data: {
              review: faker.lorem.paragraph(2),
              rating: faker.number.int(5),
              userId: userId,
              recipeId: recipeId,
            },
          });
        }
        return null; // Skip if Review Exists
      })
    );

    // Filter out any `null` values that were skipped
    const filteredReviews = reviews.filter((review) => review !== null);

    const reviewIds = filteredReviews.map((review) => review.id);

    // Add Comments.
    await Promise.all(
      [...Array(50)].map((_, i) =>
        prisma.comments.create({
          data: {
            comment: faker.lorem.paragraph(2),
            userId: userIds[Math.floor(Math.random() * userIds.length)],
            reviewId: reviewIds[Math.floor(Math.random() * reviewIds.length)],
          },
        })
      )
    );

    // Add RecipeIngredients
    await Promise.all(
      [...Array(45)].map(async (_, i) => {
        const numIngredients = faker.number.int({ min: 5, max: 30 });
        const recipeId = recipeIds[i];
        const recipeIngredients = [...Array(numIngredients)].map(() => ({
          recipeId,
          ingredientId:
            ingredientIds[Math.floor(Math.random() * ingredientIds.length)],
          quantity: faker.number.float({ min: 1, max: 5 }).toFixed(2),
          unitId: unitIds[Math.floor(Math.random() * unitIds.length)],
        }));

        // Insert RecipeIngredients
        await prisma.recipeIngredient.createMany({
          data: recipeIngredients,
        });
      })
    );

    // // // Add FavoriteRecipes
    // // await Promise.all(
    // //   users.map(async (user) => {
    // //     const numFavorites = faker.number.int({ min: 3, max: 20 });
    // //     const favoriteRecipes = [...Array(numFavorites)].map(() => ({
    // //       userId: user.id,
    // //       recipeId: recipeIds[Math.floor(Math.random() * recipeIds.length)],
    // //     }));

    // //     // Insert FavoriteRecipes, ensuring uniqueness (no duplicates)
    // //     await Promise.all(
    // //       favoriteRecipes.map(async (favorite) => {
    // //         // Check if the combination of userId and recipeId already exists
    // //         const existingFavorite = await prisma.favoriteRecipes.findFirst({
    // //           where: {
    // //             AND: [
    // //               { userId: favorite.userId },
    // //               { recipeId: favorite.recipeId },
    // //             ],
    // //           },
    // //         });

    // //         if (!existingFavorite) {
    // //           // If no existing favorite, create the new favorite
    // //           await prisma.favoriteRecipes.create({
    // //             data: favorite,
    // //           });
    // //         }
    // //       })
    // //     );
    //   })
    // );

    console.log("Database is seeded.");
  } catch (err) {
    console.error(err);
  }
}

// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;