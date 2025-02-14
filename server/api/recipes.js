const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");
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
    console.log(id);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get all Recipes
router.get("/recipes", async (req, res, next) => {
  try {
    res.send(req.recipes);
  } catch (error) {
    next(error);
  }
});

// Get my Recipes
router.get("/user/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipes = await prisma.recipes.findMany({
      where: {
        id: id,
      },
    });
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

// Create a Recipe
router.post("/recipe", isLoggedIn, async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.create({
      data: {
        user: { connect: { id: req.user.id } },
        name: req.body.name,
        description: req.body.description,
        category: { connect: { id: parseInt(req.body.category) } },
      },
    });
    res.status(201).send(recipe);
  } catch (error) {
    next(error);
  }
});

// Update a Recipe
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.update({
      where: {
        id: parseInt(req.params.id),
        creatorId: req.body.creatorId,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
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
});

// Delete a Recipe
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.findFirstOrThrow({
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
