const app = require("./app");
require("dotenv").config();
// const cloudinary = require("cloudinary").v2;
// const Multer = require("multer");

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });
// async function handleUpload(file) {
//   const res = await cloudinary.uploader.upload(file, {
//     resource_type: "auto",
//   });
//   return res;
// }

// const storage = new Multer.memoryStorage();
// const upload = Multer({
//   storage,
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`I am listening on port number ${PORT}`);
});

// app.post("/upload", upload.single("my_file"), async (req, res) => {
//   try {
//     const b64 = Buffer.from(req.file.buffer).toString("base64");
//     let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
//     const cldRes = await handleUpload(dataURI);
//     res.json(cldRes);
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: error.message,
//     });
//   }
// });
