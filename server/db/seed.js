const db = require("../db/index");
const { faker } = require("@faker-js/faker");
const { prisma } = require("../db/common");
require("dotenv").config();
const uuid = require("uuid");

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

    // Add 20 Recipes.
    
    const recipes = await Promise.all(
      [...Array(20)].map((_, i) =>
        prisma.recipes.create({
          data: {
            name: faker.food.dish(),
            description: faker.food.description(),
            categoryId: (i % 5) + 1,
            creatorId: userIds[Math.floor(Math.random() * userIds.length)],
          },
        })
      )
    );
    const recipeId = recipes.map((recipe) => recipe.id);
    // Add 5 Categories.
    await Promise.all(
      [...Array(5)].map(() =>
        prisma.categories.create({
          data: {
            name: faker.food.ethnicCategory(),
          },
        })
      )
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
