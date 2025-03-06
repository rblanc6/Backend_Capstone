const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");
const { getUserId } = require("../db/db");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
// Get all Recipes
router.get("/", async (req, res, next) => {
  try {
    const recipes = await prisma.recipes.findMany();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});
//Get all Categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany();
    res.send(categories);
  } catch (error) {
    next(error);
  }
});

//Get all Ingredient Units
router.get("/units", async (req, res, next) => {
  try {
    const units = await prisma.units.findMany();
    res.send(units);
  } catch (error) {
    next(error);
  }
});
// Get an Individual Recipe
router.get("/recipe/:id", async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        ingredient: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
        instructions: true,
        categories: true,
        review: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            comments: {
              select: {
                id: true,
                comment: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});
// Get A Logged-in User's Recipes
router.get("/user/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const recipes = await prisma.recipes.findMany({
      where: {
        creatorId: userId,
      },
    });
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});
// Create a Recipe
// router.post(
//   "/recipe",
//   isLoggedIn,
//   upload.single("photo"),
//   async (req, res, next) => {
//     console.log(req.body); // Other form fields
//     console.log(req.file);
//     try {
//       const categoryIds = req.body.category
//         ? JSON.parse(req.body.category).map((id) => parseInt(id))
//         : [];
//       if (categoryIds === 0) {
//         return res.status(400).send({ error: "Categories are required" });
//       }
//       const instructionsArray = req.body.instructions
//         // ? JSON.parse(req.body.instructions)
//         // : [];
//       const instructIds = [];
//       for (const instruct of instructionsArray) {
//         const result = await prisma.instructions.upsert({
//           where: { instruction: instruct },
//           update: {},
//           create: { instruction: instruct },
//         });
//         instructIds.push({ id: result.id });
//       }
//       const ingredientsData = req.body.ingredient
//         ? JSON.parse(req.body.ingredient).map(async (ingredient) => {
//             const { name, quantity, unitName } = ingredient;
//             const unit = await prisma.units.upsert({
//               where: { name: unitName },
//               update: {},
//               create: { name: unitName },
//             });
//             const ingredientRecord = await prisma.ingredients.upsert({
//               where: { name: name },
//               update: {},
//               create: { name: name },
//             });
//             return {
//               ingredientId: ingredientRecord.id,
//               quantity: quantity,
//               unitId: unit.id,
//             };
//           })
//         : [];
//       const ingredientData = await Promise.all(ingredientsData);

//       // Create the recipe with the parsed data
//       const recipe = await prisma.recipes.create({
//         data: {
//           user: { connect: { id: req.user.id } },
//           name: req.body.name,
//           description: req.body.description,
//           ingredient: {
//             create: ingredientData.map((ingredient) => ({
//               ingredientId: ingredient.ingredientId,
//               quantity: ingredient.quantity,
//               unitId: ingredient.unitId,
//             })),
//           },
//           instructions: {
//             connect: instructIds,
//           },
//           photo: req.file,
//           categories: {
//             connect: categoryIds.map((id) => ({ id })),
//           },
//         },
//       });
//       res.status(201).send(recipe);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// Create a Recipe
router.post("/recipe", isLoggedIn, async (req, res, next) => {
  try {
    const categoryIds = req.body.categories.map((id) => parseInt(id));
    const instructionsArray = Array.isArray(req.body.instructions)
      ? req.body.instructions
      : [req.body.instructions];
    const instructIds = [];
    for (const instruct of instructionsArray) {
      const result = await prisma.instructions.upsert({
        where: { instruction: instruct },
        update: {},
        create: { instruction: instruct },
      });
      instructIds.push({ id: result.id });
    }

    const ingredientsData = req.body.ingredients.map(async (ingredient) => {
      const { name, quantity, unitName } = ingredient;
      const unit = await prisma.units.upsert({
        where: { name: unitName },
        update: {},
        create: { name: unitName },
      });
      const ingredientRecord = await prisma.ingredients.upsert({
        where: { name: name },
        update: {},
        create: { name: name },
      });
      return {
        ingredientId: ingredientRecord.id,
        quantity: quantity,
        unitId: unit.id,
      };
    });
    const ingredientData = await Promise.all(ingredientsData);
    const recipe = await prisma.recipes.create({
      data: {
        user: { connect: { id: req.user.id } },
        name: req.body.name,
        description: req.body.description,
        ingredient: {
          create: ingredientData.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
            unitId: ingredient.unitId,
          })),
        },
        instructions: {
          connect: instructIds,
        },
        photo: req.body.photo,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
    res.status(201).send(recipe);
  } catch (error) {
    next(error);
  }
});

// UPDATE RECIPE

// Update a Logged-in User's Recipe
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const removedIngredientIds = req.body.removedIngredientIds || [];
    const removedInstructionIds = req.body.removedInstructionIds || [];

    const categoryIds = Array.isArray(req.body.categories)
      ? req.body.categories.map((id) => parseInt(id))
      : [];
    const instructionsArray = Array.isArray(req.body.instructions)
      ? req.body.instructions
      : [req.body.instructions];
    const instructIds = [];
    for (const instruct of instructionsArray) {
      const instructionText =
        typeof instruct === "object" &&
        instruct !== null &&
        instruct.instruction
          ? instruct.instruction
          : instruct;
      if (!instructionText || typeof instructionText !== "string") {
        console.error("Invalid instruction:", instruct);
        continue;
      }
      const result = await prisma.instructions.upsert({
        where: { instruction: instructionText },
        update: {},
        create: { instruction: instructionText },
      });
      instructIds.push({ id: result.id });
    }
    const ingredientsData = req.body.ingredients.map(async (ingredient) => {
      const { name, quantity, unitName } = ingredient;
      const unit = await prisma.units.upsert({
        where: { name: unitName },
        update: {},
        create: { name: unitName },
      });
      const ingredientRecord = await prisma.ingredients.upsert({
        where: { name: name },
        update: {},
        create: { name: name },
      });
      return {
        ingredientId: ingredientRecord.id,
        quantity: quantity,
        unitId: unit.id,
      };
    });
    const ingredientData = await Promise.all(ingredientsData);
    const recipe = await prisma.recipes.update({
      where: {
        id: parseInt(req.params.id),
        creatorId: req.body.creatorId,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
        ingredient: {
          deleteMany: {
            id: { in: removedIngredientIds },
          },
          create: ingredientData.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
            unitId: ingredient.unitId,
          })),
        },
        instructions: {
          connect: instructIds,

          disconnect:
            removedInstructionIds.length > 0
              ? removedInstructionIds.map((id) => ({ id: parseInt(id) }))
              : [],
        },
        photo: req.body.photo,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

// Remove a Category from a Logged-in User's Recipe
router.put("/removecategory/:id", isLoggedIn, async (req, res, next) => {
  try {
    const categoryIdToRemove = parseInt(req.body.categories);
    const recipe = await prisma.recipes.update({
      where: { id: parseInt(req.params.id) },
      data: {
        categories: { disconnect: { id: categoryIdToRemove } },
      },
    });
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});
// Favorite a Recipe
router.post("/favorite", isLoggedIn, async (req, res, next) => {
  try {
    const favorite = await prisma.favoriteRecipes.create({
      data: {
        user: { connect: { id: req.user.id } },
        recipe: { connect: { id: parseInt(req.body.recipe) } },
      },
    });
    res.status(201).send(favorite);
  } catch (error) {
    next(error);
  }
});
// Get All Logged-in User's Favorite Recipes
router.get("/favorites/:recipeId", isLoggedIn, async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    console.log(recipeId);
    const recipes = await prisma.favoriteRecipes.findMany({
      where: {
        recipeId: parseInt(recipeId),
        userId: req.user.id,
      },
    });
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});
// Delete a Logged-in User's Favorite Recipe
router.delete("/favorite/:recipeId", isLoggedIn, async (req, res, next) => {
  try {
    const favorite = await prisma.favoriteRecipes.delete({
      where: {
        favoriteId: {
          userId: req.user.id,
          recipeId: parseInt(req.params.recipeId),
        },
      },
    });
    res.status(204).send(favorite);
  } catch (error) {
    next(error);
  }
});
// Delete a Logged-in User's Recipe
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.delete({
      where: {
        id: parseInt(req.params.id),
        creatorId: req.user.id,
      },
    });
    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }
    res.status(204).send(recipe);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
