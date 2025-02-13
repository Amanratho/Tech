const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer Storage for Temporary File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // Temporary folder
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Adds a unique suffix
  },
});

// Multer Middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (adjust if needed)
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|pdf/; // Added PDF to the allowed types
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
      return cb(null, true); // File is valid
    }
    return cb(new Error("Only image files (JPEG, JPG, PNG) files are allowed!"), false);
  },
});

// Error Handling Middleware for Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Cloudinary Upload Function
const uploadOnCloudinary = async (filePath, transformations = {}) => {
  if (!filePath || typeof filePath !== "string") {
    console.error("Invalid file path provided.");
    return null;
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detects the file type (image/pdf)
      ...transformations, 
    });
    console.log("File uploaded on Cloudinary: " + uploadResult.secure_url);
    return uploadResult.secure_url; // Returns the URL of the uploaded file
  } catch (error) {
    console.error("Failed to upload file to Cloudinary: ", error);
    return null;
  }
};

module.exports = { upload, handleMulterError, uploadOnCloudinary };
