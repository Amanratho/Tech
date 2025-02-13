import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async function (locaFilePath, transformations = {}) {
  if (!locaFilePath || typeof locaFilePath !== "string") {
    console.error("Invalid file path provided.");
    return null;
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(locaFilePath, {
      resource_type: "auto",
      ...transformations, 
    });
    console.log("Image uploaded on Cloudinary: " + uploadResult.secure_url);
    return uploadResult.secure_url; 
  } catch (error) {
    console.error("Failed to upload image on Cloudinary: ", error);
    return null;
  }
};


const cleanupFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete local file: ", filePath);
    } else {
      console.log("Local file deleted: ", filePath);
    }
  });
};

export { uploadOnCloudinary, cleanupFile };
