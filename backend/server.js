import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// Create upload folders if they don’t exist
const uploadsDir = path.resolve("uploads");
const bannersDir = path.resolve("uploads/banners");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir);

// ===============
// SECTION 1 (Resources Upload)
// ===============

const upload = multer({
  dest: "uploads/",
});

let images = [];

app.post("/upload", upload.single("file"), (req, res) => {
  const { link, subtitle } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const imageData = {
    filename: file.filename,
    originalName: file.originalname,
    link: link || null,
    subtitle: subtitle || "",
  };

  images.push(imageData);
  res.json({ message: "File uploaded successfully", image: imageData });
});

app.get("/images", (req, res) => {
  res.json({ images });
});

app.delete("/images/subtitle/:subtitle", (req, res) => {
  const { subtitle } = req.params;
  const index = images.findIndex((img) => img.subtitle === subtitle);
  if (index === -1)
    return res.status(404).json({ message: "Image not found" });

  const filePath = path.join("uploads", images[index].filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  images.splice(index, 1);
  res.json({ message: "Deleted successfully" });
});

// ===============
// SECTION 2 (Banner Upload)
// ===============

// Custom multer config that saves files using their **original name**
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannersDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original filename
  },
});

const uploadBanner = multer({ storage: bannerStorage });

// Upload banner endpoint
app.post("/upload_banner", uploadBanner.single("file"), (req, res) => {
  const file = req.file;

  if (!file)
    return res.status(400).json({ message: "No file uploaded." });

  const imageUrl = `http://localhost:5000/uploads/banners/${file.originalname}`;

  res.json({
    message: "Banner uploaded successfully!",
    imageUrl,
  });
});

// Delete banner endpoint by filename
app.delete("/delete_banner/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(bannersDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found." });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: "Banner deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting file." });
  }
});

// Serve uploads (for both sections)
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => console.log("Server running on port 5000"));
