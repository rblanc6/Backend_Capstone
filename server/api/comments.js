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

// Write a Comment
router.post("/comment", isLoggedIn, async (req, res, next) => {
  try {
    const comment = await prisma.comments.create({
      data: {
        user: { connect: { id: req.user.id } },
        review: { connect: { id: parseInt(req.body.review) } },
        comment: req.body.comment,
      },
      
    });
    res.status(201).send(comment);
  } catch (error) {
    next(error);
  }
});

// Get Comments Made by a Logged-in User
router.get("/user/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.findMany({
      where: {
        userId: req.params.userId,
      },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// Get Individual Comment
router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.findMany({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// Update a Logged-in User's Comment
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        comment: req.body.comment,
      },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// Delete a Logged-in User's Comment
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    console.log(comments);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
