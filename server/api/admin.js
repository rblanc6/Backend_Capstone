const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");

// Import functions
const { getUserId } = require("../db/db");

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

// Authorize Admin
const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// View List of All Recipes
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

// Add Recipes
router.post(
  "/recipe",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
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
  }
);

// Edit Recipes
router.put(
  "/recipe/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
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
      const recipe = await prisma.recipes.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
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
      if (!recipe) {
        return res.status(404).send("Recipe not found.");
      }
      res.send(recipe);
    } catch (error) {
      next(error);
    }
  }
);

// Remove a Category from a Recipe
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

// Remove Recipes
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

// Get All Users as Admin
router.get(
  "/users",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const users = await prisma.users.findMany({});
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);

// Update User Roles as Admin
router.put(
  "/user/:id",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const assignAdmin = await prisma.users.update({
        where: {
          id: id,
        },
        data: {
          role: role,
        },
      });
      res.send(assignAdmin);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a User as Admin
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
