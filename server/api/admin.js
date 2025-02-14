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
