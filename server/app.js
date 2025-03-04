const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(cors());

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());

// Backend routes
app.use("/api", require("./api"));

app.options('*', cors()); // Handle OPTIONS pre-flight requests


app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://backend-capstone-z53c.onrender.com/api"
  ); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: err });
});

module.exports = app;
