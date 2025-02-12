const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`I am listening on port number ${PORT}`);
});
