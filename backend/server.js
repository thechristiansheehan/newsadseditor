import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Store metadata (filename + link + subtitle)
let images = [];

app.post("/upload", upload.single("file"), (req, res) => {
  const { link, subtitle } = req.body; // ✅ extract subtitle too
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

// Serve image list
app.get("/images", (req, res) => {
  res.json({ images });
});
app.delete("/images/subtitle/:subtitle", (req, res) => {
  const { subtitle } = req.params;
  const index = images.findIndex(img => img.subtitle === subtitle);
  if (index === -1) return res.status(404).json({ message: "Image not found" });

  // Optionally remove file from uploads folder
  // fs.unlinkSync(`uploads/${images[index].filename}`);

  images.splice(index, 1);
  res.json({ message: "Deleted successfully" });
});


// Serve static files
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => console.log("Server running on port 5000"));
