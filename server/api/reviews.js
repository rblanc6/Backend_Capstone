const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");

// Import functions
const { getUserId } = require("../db/db");

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


// Post a Review
router.post("/review", isLoggedIn, async (req, res, next) => {
  try {
    // Check if user already reviewed this recipe
    const duplicatedReview = await prisma.reviews.findFirst({
      where: {
        userId: req.user.id,
        recipeId: parseInt(req.body.recipe),
      },
    });
    if (duplicatedReview) {
      return res
        .status(401)
        .json({ message: "Error: You have already reviewed this recipe." });
    }

    // Create new review in database
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

// Get All Reviews
router.get("/", async (req, res, next) => {
  try {
    // Get all reviews from database
    const review = await prisma.reviews.findMany();
    res.send(review);
  } catch (error) {
    next(error);
  }
});

// Get all Reviews by Logged-In User
router.get("/user/:userId", isLoggedIn, async (req, res, next) => {
  try {
    // Get all reviews by user from database
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

// Get an Individual Review
router.get("/:id", async (req, res, next) => {
  try {
    // Get review by ID from database
    const review = await prisma.reviews.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.send(review);
  } catch (error) {
    next(error);
  }
});

// Update a Logged-In User's Review
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    // Update review in database
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

// Delete a Logged-In User's Review
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    // Delete a review from database
    const reviews = await prisma.reviews.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    res.status(204).send(reviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
