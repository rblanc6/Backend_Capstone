const db = require("../db/index");
const { faker } = require("@faker-js/faker");
const { prisma } = require("../db/common");
require("dotenv").config();
const uuid = require("uuid");
const { connect } = require("../api");

async function seed() {
  console.log("Seeding the database.");
  try {
    await db.query("DROP TABLE IF EXISTS users, items, comments, reviews;");

    // Add 5 Users, collect their ID's.
    const users = await Promise.all(
      [...Array(5)].map(() =>
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

    // Add 5 Categories.
    const categories = await Promise.all(
      [...Array(5)].map(() =>
        prisma.categories.create({
          data: {
            name: faker.food.ethnicCategory(),
          },
        })
      )
    );
    const categoryId = categories.map((category) => category.id);

    // Add 5 Ingredients.
    const ingredient = await Promise.all(
      [...Array(5)].map(() =>
        prisma.ingredients.create({
          data: {
            name: faker.food.ingredient(),
          },
        })
      )
    );
    const ingredientId = ingredient.map((ingredient) => ingredient.id);

    // Add 5 Units.
    const units = await Promise.all(
      [...Array(5)].map(() =>
        prisma.units.create({
          data: {
            name: faker.lorem.word(),
          },
        })
      )
    );
    const unitId = units.map((unit) => unit.id);

    // Add 20 Recipes.

    const recipes = await Promise.all(
      [...Array(20)].map((_, i) =>
        prisma.recipes.create({
          data: {
            name: faker.food.dish(),
            description: faker.food.description(),
            instructions: faker.food.description(),
            photo: faker.image.url(),
            categories: {
              connect: {
                id: categoryId[Math.floor(Math.random() * categoryId.length)],
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
    const recipeId = recipes.map((recipe) => recipe.id);

    // Add 5 RecipeIngredients.
    const recipeIngredient = await Promise.all(
      [...Array(5)].map(() =>
        prisma.recipeIngredient.create({
          data: {
            recipe: {
              connect: {
                id: recipeId[Math.floor(Math.random() * recipeId.length)],
              },
            },
            ingredient: {
              connect: {
                id: ingredientId[
                  Math.floor(Math.random() * ingredientId.length)
                ],
              },
            },
            quantity: faker.finance.amount(),
            unit: {
              connect: {
                id: unitId[Math.floor(Math.random() * unitId.length)],
              },
            },
          },
        })
      )
    );
    const recipeIngredientId = recipeIngredient.map(
      (recipeIngredient) => recipeIngredient.id
    );

    // Add 10 Reviews, collect their ID's.
    // const reviews = await Promise.all(
    //   [...Array(10)].map((_, i) =>
    //     prisma.reviews.create({
    //       data: {
    //         review: faker.lorem.paragraph(2),
    //         rating: faker.number.int(5),
    //         userId: userIds[Math.floor(Math.random() * userIds.length)],
    //         recipeId: (i % 5) + 1,
    //       },
    //     })
    //   )
    // );
    // const reviewIds = reviews.map((review) => review.id);

    // // Add 10 Comments.
    // await Promise.all(
    //   [...Array(10)].map((_, i) =>
    //     prisma.comments.create({
    //       data: {
    //         comment: faker.lorem.paragraph(2),
    //         userId: userIds[Math.floor(Math.random() * userIds.length)],
    //         reviewId: reviewIds[Math.floor(Math.random() * reviewIds.length)],
    //       },
    //     })
    //   )
    // );

    // Add ingredients

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
