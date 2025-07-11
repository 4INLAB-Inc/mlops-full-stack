// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // ✅ Read server URL from environment variable or fallback to local IP
// const serverUrl = process.env.NEXT_PUBLIC_SERVER_NODE_API || "http://192.168.219.52:4000";
// const parsedUrl = new URL(serverUrl);
// const HOST = "0.0.0.0"; // Allows access from any device on the LAN
// const PORT = parseInt(parsedUrl.port, 10) || 4000;

// // ✅ Enable CORS for all origins (LAN-compatible)
// app.use(cors());
// app.use(express.json());

// // ✅ Ensure the upload directory exists
// const uploadDir = path.join(__dirname, "public", "model-thumbnails");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ✅ Configure Multer to store uploaded files using original filenames
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, file.originalname),
// });
// const upload = multer({ storage });

// // ✅ API endpoint to handle image upload
// app.post("/api/upload-thumbnail", upload.single("image_file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   // Return the relative file path for frontend usage
//   const filePath = `/model-thumbnails/${req.file.originalname}`;
//   res.status(200).json({ filePath });
// });

// // ✅ Serve uploaded thumbnails statically so frontend can access them
// app.use("/model-thumbnails", express.static(uploadDir));

// // ✅ Start the server
// app.listen(PORT, HOST, () => {
//   console.log(`✅ Server is running at ${serverUrl}`);
// });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Read server URL from environment variable or fallback to local IP
const serverUrl = process.env.NEXT_PUBLIC_SERVER_NODE_API || "http://localhost:4000";
const parsedUrl = new URL(serverUrl);
const HOST = "0.0.0.0"; // Allows access from any device on the LAN
const PORT = parseInt(parsedUrl.port, 10) || 4000;

// ✅ Enable CORS for all origins (LAN-compatible)
app.use(cors());
app.use(express.json());

// ✅ Ensure the upload directory exists
const uploadDir = path.join(__dirname, "public", "model-thumbnails");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// // ✅ Configure Multer to store uploaded files using original filenames
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const modelName = req.body.model_name || 'unknown_model';
//     const safeName = modelName.trim().replace(/\s+/g, "_").toLowerCase(); // Ex: "Yolo v7" → yolo_v7
//     const newFileName = `${safeName}${ext}`; // No _thum, just model_name.extension
//     cb(null, newFileName);
//   }
// });

// const upload = multer({ storage });

// // ✅ API endpoint to handle image upload
// app.post("/api/upload-thumbnail", upload.single("image_file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   const filePath = `/model-thumbnails/${req.file.filename}`;
//   return res.status(200).json({ filePath });
// });
const storage = multer.memoryStorage(); // Store in memory temporarily

const upload = multer({ storage });

app.post("/api/upload-thumbnail", upload.single("image_file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const modelName = req.body.model_name || 'unknown model';
  const ext = path.extname(req.file.originalname);

  // 🟢 Keep spaces, just lowercase + append _thum
  const safeName = modelName.trim().toLowerCase(); // don't replace spaces
  const fileName = `${safeName}_thum${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFile(filePath, req.file.buffer, err => {
    if (err) {
      console.error("❌ Error saving file:", err);
      return res.status(500).json({ message: "Failed to save file" });
    }

    return res.status(200).json({ filePath: `/model-thumbnails/${fileName}` });
  });
});


// ✅ Serve uploaded thumbnails statically so frontend can access them
app.use("/model-thumbnails", express.static(uploadDir));

// ✅ Start the server
app.listen(PORT, HOST, () => {
  console.log(`✅ Server is running at ${serverUrl}`);
});

