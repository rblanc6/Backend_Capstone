const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");
const cloudinary = require("cloudinary").v2;
const Multer = require("multer");

// Import functions
const { getUserId } = require("../db/db");

// Configure Cloudinary for image uploads
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Function to handle image uploads to Cloudinary
async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

// Configure Multer for handling file uploads in memory
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  // Extract authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    // Verify token and retrieve user ID
    const { id } = jwt.verify(token, JWT);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check required role, authorize Admin
const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Get All Recipes (Admin only)
router.get(
  "/recipes",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const recipes = await prisma.recipes.findMany();
      res.send(recipes);
    } catch (error) {
      next(error);
    }
  }
);

// Add a New Recipe (Admin only)
router.post(
  "/recipe",
  upload.single("my_file"),
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      // Extract and process categories, ingredients, and instructions
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

      // Extract ingredients from requested body, check if its an array
      const { ingredients } = req.body;
      if (Array.isArray(ingredients)) {
        console.log("Ingredients received:", ingredients);
      } else {
        console.error("Ingredients not received as array:", ingredients);
      }

      // Process ingredients
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

      // Create new recipe in database
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
  }
);

// Upload a photo
router.post("/upload", upload.single("my_file"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);
    res.json(cldRes);
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
});

// Edit any recipe (Admin only)
router.put(
  "/recipe/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      // Extract removed ingredient and category IDs
      const removedIngredientIds = req.body.removedIngredientIds || [];
      const removedCategoryIds = req.body.removedCategoryIds || [];

      // Parse categories and instructions
      const categoryIds = Array.isArray(req.body.categories)
        ? req.body.categories.map((id) => parseInt(id))
        : [];
      const newInstructionsArray = Array.isArray(req.body.newInstructions)
        ? req.body.newInstructions
        : [req.body.newInstructions];
      const existingInstructionsArray = Array.isArray(
        req.body.existingInstructions
      )
        ? req.body.existingInstructions
        : [req.body.existingInstructions];
      console.log(
        "Existing Instructions (backend):",
        existingInstructionsArray
      );

      // Process new ingredients
      const newIngredientsData = req.body.newIngredients.map(
        async (ingredient) => {
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
        }
      );

      // Process existing ingredients
      const existingIngredientsData = req.body.existingIngredients.map(
        async (ingredient) => {
          const { id, name, quantity, unitName } = ingredient;
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
          return prisma.recipeIngredient.update({
            where: { id: id },
            data: {
              ingredientId: ingredientRecord.id,
              quantity: quantity,
              unitId: unit.id,
            },
          });
        }
      );
      const newIngredientData = await Promise.all(newIngredientsData);
      const existingIngredientData = await Promise.all(existingIngredientsData);

      // Retrieve the current recipe
      const currentRecipe = await prisma.recipes.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { instructions: true }, // Include instructions for comparison
      });

      if (!currentRecipe) {
        return res.status(404).send("Recipe not found.");
      }

      // Process new and removed instructions
      const newInstructIds = [];
      const removedInstructionIds = req.body.removedInstructionIds || []; // Ensure removedInstructionIds is initialized

      for (const instruct of newInstructionsArray) {
        const instructionText = instruct.instruction;
        const existingInstruction = await prisma.instructions.findFirst({
          where: { instruction: instructionText },
        });

        if (existingInstruction) {
          // Instruction already exists, connect it
          newInstructIds.push({ id: existingInstruction.id });
          if (
            instruct.id &&
            instruct.instruction !==
              currentRecipe.instructions.find((i) => i.id === instruct.id)
                ?.instruction
          ) {
            removedInstructionIds.push(instruct.id); // Add original instruction ID to removedInstructionIds
          }
        } else {
          // Instruction doesn't exist, create it
          const result = await prisma.instructions.create({
            data: { instruction: instructionText },
          });
          newInstructIds.push({ id: result.id });
          if (
            instruct.id &&
            instruct.instruction !==
              currentRecipe.instructions.find((i) => i.id === instruct.id)
                ?.instruction
          ) {
            removedInstructionIds.push(instruct.id); // Add original instruction ID to removedInstructionIds
          }
        }
      }

      // Update the recipe
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
            create: newIngredientData.map((ingredient) => ({
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unitId: ingredient.unitId,
            })),
            update: existingIngredientData.map((ingredient) => ({
              where: { id: ingredient.id },
              data: {
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unitId: ingredient.unitId,
              },
            })),
          },
          instructions: {
            connect:
              newInstructIds.length > 0
                ? newInstructIds.map((inst) => ({ id: inst.id }))
                : undefined,
            disconnect:
              removedInstructionIds.length > 0
                ? removedInstructionIds.map((id) => ({ id: parseInt(id) }))
                : undefined,
          },
          photo: req.body.photo,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
            disconnect:
              removedCategoryIds.length > 0
                ? removedCategoryIds.map((id) => ({ id: parseInt(id) }))
                : [],
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
  }
);

// Remove a Category from a Recipe (Admin only)
router.put(
  "/recipe/removecategory/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
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
  }
);

// Delete a Recipe (Admin only)
router.delete(
  "/recipe/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const recipe = await prisma.recipes.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      if (!recipe) {
        return res.status(404).send("Recipe not found.");
      }
      res.status(204).send(recipe);
    } catch (error) {
      next(error);
    }
  }
);

// Get All Users (Admin only)
router.get(
  "/users",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const users = await prisma.users.findMany({
        include: { reviews: true, comments: true, recipes: true },
      });
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);

// Get Individual User Additional Details (Admin only)
router.get(
  "/user/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { recipes, favorites } = req.body;
      const userDetails = await prisma.users.findUnique({
        where: {
          id: id,
        },
        include: {
          reviews: { include: { recipe: { include: { review: true } } } },
          comments: { include: { review: { include: { recipe: true } } } },
          recipes: {
            include: {
              review: {
                include: {
                  comments: true,
                },
              },
            },
          },
        },
      });
      res.send(userDetails);
    } catch (error) {
      next(error);
    }
  }
);

// Update User details (Admin only)
router.put(
  "/user/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await prisma.users.update({
        where: {
          id: id,
        },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          role: req.body.role,
        },
      });
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a User (Admin only)
router.delete(
  "/user/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await prisma.users.delete({
        where: {
          id: id,
        },
      });
      res.status(204).send(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
