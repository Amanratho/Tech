const machineRegModel = require("../models/machineRegModel");
const { body, validationResult } = require("express-validator");
const { uploader } = require("cloudinary");
const { v2: cloudinary } = require("cloudinary"); // Correctly import Cloudinary

const fs = require("fs");

// Helper function to delete local file
const deleteLocalFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

// Get all machines with pagination
exports.getAllMachines = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Pagination parameters
  try {
    const filter = { isActive: { $ne: false } };
    const machines = await machineRegModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await machineRegModel.countDocuments(filter);
    res.status(200).json({ success: true, page, limit, total, data: machines });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Add a new machine
exports.addMachine = [
  body("Machine_name").isLength({ max: 50 }).withMessage("Machine name cannot exceed 50 characters"),
  body("RentType").notEmpty().withMessage("Rent type is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { Machine_name, RentType, uid,Machine_id } = req.body;
    const { path: localPath } = req.file || {};

    if (!localPath) {
      return res.status(400).json({ success: false, message: "No image uploaded!" });
    }

    try {
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localPath);
      const image_filename = uploadResult.secure_url;

      // Delete local file
      deleteLocalFile(localPath);

      // Save machine to the database
      const newMachine = await machineRegModel.create({
        Machine_name,
        RentType,
        image: image_filename,
        Machine_id,
        uid
      });

      res.status(201).json({ success: true, data: newMachine });
    } catch (error) {
      console.error("Error in addMachine:", error.message);
      res.status(500).json({ success: false, message: "Failed to add machine", error: error.message });
    }
  },
];


// Get a machine by ID
exports.getMachineById = async (req, res) => {
  const { Machine_id } = req.params;
  try {
    const machine = await machineRegModel.findById(Machine_id);
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }
    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};



// Update a machine by Machine_id (string)
exports.updateMachine = async (req, res) => {
  const { id } = req.params; 
  const { Machine_name, RentType } = req.body;
  const { path: localPath } = req.file || {}; 

  try {
    let image_filename = null;

    
    if (localPath) {
      const uploadResult = await cloudinary.uploader.upload(localPath);
      image_filename = uploadResult.secure_url;

      // Delete local file after uploading to Cloudinary
      deleteLocalFile(localPath);
    }

    // Update machine details in the database
    const updatedMachine = await machineRegModel.findOneAndUpdate(
      { Machine_id: id },
      {
        Machine_name,
        RentType,
        image: image_filename || undefined, // Update image only if new image is uploaded
      },
      { new: true, runValidators: true }
    );

    if (!updatedMachine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    res.status(200).json({ success: true, data: updatedMachine });
  } catch (error) {
    console.error("Error updating machine:", error);
    res.status(500).json({ success: false, message: "Failed to update machine", error });
  }
};


// Soft-delete (archive) a machine by ID

exports.deleteMachine = async (req, res) => {
  const { id } = req.params; 

  try {
    const archivedMachine = await machineRegModel.findOneAndUpdate(
      { Machine_id: id },
      { isActive: false, archivedAt: new Date() },
      { new: true }
    );

    if (!archivedMachine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    res.status(200).json({ success: true, message: "Machine archived successfully", data: archivedMachine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

