const cloudinary = require("cloudinary").v2;
const admin = require("firebase-admin");
const Machine = require("../models/machineRegModel");
const Rental = require("../models/RentalModel");
const User = require("../models/User");

// Cloudinary Config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    console.log("🟡 Received Image URL:", imageUrl);

    // Extract public_id correctly
    const publicId = imageUrl.split("/").pop().split(".")[0];

    console.log("🔵 Extracted Public ID:", publicId);

    // Delete image from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);

    console.log("🟢 Cloudinary Delete Response:", response);

  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
  }
};


const deleteUserAccount = async (uid) => {
  try {
    console.log("🔵 Deleting user:", uid);
    
    // Check if user exists
    const user = await User.findOne({ uid });
    if (!user) {
      // console.log("🔴 User not found in database");
      throw new Error("User not found");
    }
    
    // Fetch all machines associated with the user
    const machines = await Machine.find({ uid });
    // console.log("Machines found:", machines.length);

    // Delete images from Cloudinary
    for (const machine of machines) {
      // console.log("Deleting machine image:", machine.image);
      await deleteImageFromCloudinary(machine.image);
      await Machine.deleteOne({ _id: machine._id });
    }

    // Delete rental entries
    await Rental.deleteMany({ uid });

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Delete user from MongoDB
    await User.deleteOne({ uid });

    // console.log("🟢 User account and related data deleted successfully.");
  } catch (error) {
    // console.error("❌ Error in deleteUserAccount:", error);
    throw error;
  }
};

module.exports = { deleteUserAccount };