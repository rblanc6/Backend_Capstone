const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");

// Import functions
const { createUser, getUser, getUserId } = require("../db/db");

const setToken = (id) => {
  return jwt.sign({ id }, JWT, { expiresIn: "5h" });
};

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  // Extract authorization header
  const authHeader = req.headers.authorization;
  // Check if token is provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  // Extract token from header
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    // Verify token and retrieve user ID
    const { id } = jwt.verify(token, JWT);
    const user = await getUserId(id);
    // Attach user data to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Register a new user
router.post("/register", async (req, res, next) => {
  try {
    // Extract user details from request body
    const { firstName, lastName, email, password } = req.body;
     // Check if email already exists in database
    const existingUser = await prisma.users.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "This email is already in use. Please use a different one.",
        });
    } else {
      // Create new user in database
      const response = await createUser(firstName, lastName, email, password);
      const token = setToken(response.id);
      res.status(201).json({ token, user: response });
    }
  } catch (error) {
    next(error);
  }
});

// Login a User
router.post("/login", async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    const user = await getUser(email, password);
    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = setToken(user.id);
      // Respond with token and user role
      res.status(200).json({ token, role: user.role, user: user });
    } else {
      res.status(403).json({ message: "Username and Password do not match" });
    }
  } catch (error) {
    next(error);
  }
});

// Get the Logged-in User's Information
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    // Extract user ID from request object
    const userId = req.user.id;
    // Fetch user details
    const response = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        recipes: {
          include: {
            review: true,
          },
        },
        favorites: {
          include: {
            recipe: { include: { review: true } },
          },
        },
        reviews: {
          include: {
            recipe: {
              include: {
                user: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: true,
            review: {
              include: {
                recipe: true,
                user: true,
              },
            },
          },
        },
      },
    });

    res.send(response);
  } catch (error) {
    next(error);
  }
});

// Get a Single User by Id
router.get("/user/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    // Fetch user details from database
    const user = await prisma.users.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Update Logged-In User
router.put("/user/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    // Update user details in database
    const user = await prisma.users.update({
      where: {
        id: id,
      },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
