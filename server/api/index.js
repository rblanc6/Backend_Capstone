const router = require("express").Router();

//Import Backend routes
router.use("/auth", require("./auth"));
router.use("/admin", require("./admin"));
router.use("/recipes", require("./recipes"));
router.use("/comments", require("./comments"));
router.use("/reviews", require("./reviews.js"));

module.exports = router;
