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

// TO DO
// View List of All Recipes
router.get("/recipes", isLoggedIn, checkRole(["ADMIN"]), async (req, res, next) => {
  try {
    const recipes = await prisma.recipes.findMany();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

// Add Recipes
router.post(
  "/recipe",
  isLoggedIn,
  checkRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const recipe = await prisma.recipes.create({
        data: {
          user: { connect: { id: req.user.id } },
          name: req.body.name,
          description: req.body.description,
          instructions: req.body.instructions,
          category: { connect: { id: parseInt(req.body.category) } },
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
      const recipe = await prisma.recipes.update({
        where: {
          id: parseInt(req.params.id),
          // creatorId: req.body.creatorId,
        },
        data: {
          name: req.body.name,
          description: req.body.description,
          instructions: req.body.instructions,
          category: { connect: { id: parseInt(req.body.category) } },
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
// Add Category to Recipe
// Add Photo to Recipe

// Administrators should be able to add and modify relevant information on an item. It is up to you to decide what information is relevant, necessary, or otherwise.

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
