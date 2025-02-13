const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");

// Import functions
const { createRecipe } = require("../db/db");

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
    const recipes = await prisma.users.findMany({
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
    const { name, description } = req.body;
    const response = await createRecipe(name, description);
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
});

// Update a Recipe
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const recipe = await prisma.recipes.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
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
    const recipe = await prisma.recipe.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }
    return res.send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
