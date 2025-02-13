const express = require('express');
const { upload, handleMulterError, uploadOnCloudinary } = require('../utils/multerCloudinary');
const router = express.Router();

// Route to upload a PDF or image file to Cloudinary
router.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Upload the file to Cloudinary
    const cloudinaryUrl = await uploadOnCloudinary(req.file.path);
    
    if (!cloudinaryUrl) {
      return res.status(500).send("Failed to upload file to Cloudinary.");
    }

    // Send the URL of the uploaded file as response
    res.json({ fileUrl: cloudinaryUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle Multer Errors (File validation)
router.use(handleMulterError);

module.exports = router;
