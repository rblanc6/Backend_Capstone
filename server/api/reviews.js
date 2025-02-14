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

//Post a review
router.post("/", isLoggedIn, async (req, res, next) => {
  try {
      const duplicatedReview = await prisma.reviews.findFirst({
        where: {
          userId: req.user.id,
          recipeId: parseInt(req.body.recipe),
        },
      });
      if (duplicatedReview) {
        return res.status(401).json({ message: "Error: You have already reviewed this recipe." });
      }
      const review = await prisma.reviews.create({
        data: {
          user: { connect: { id: req.user.id } },
          recipe: { connect: { id: parseInt(req.body.recipe) } },
          review: req.body.review,
          rating: parseInt(req.body.rating),
        },
      });
      res.status(201).send(review);
    } catch (error) {
      next(error);
    }
  });

//Get all reviews
router.get("/", async (req, res, next) => {
  try {
    const review = await prisma.reviews.findMany();
    res.send(review);
  } catch (error) {
    next(error);
  }
});

//Get all reviews by user
router.get("/user/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const review = await prisma.reviews.findMany({
      where: {
        userId: req.params.userId,
      },
    });
    res.send(review);
  } catch (error) {
    next(error);
  }
});

//Get individual review
router.get("/review/:id", async (req, res, next) => {
  try {
    const review = await prisma.reviews.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.send(review);
  } catch (error) {
    next(error);
  }
});

//Update user's review
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        review: req.body.review,
        rating: parseInt(req.body.rating),
      },
    });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

//Delete user's review
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(204).send(reviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
