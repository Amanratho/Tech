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
  const { id } = req.params;
  const machine = await machineRegModel.findOne({ Machine_id: id });
  res.json(machine);
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

// Get all machines with their financial summaries (rentals & maintenance) for a specific user
exports.getMachineSummaryByUid = async (req, res) => {
  const { uid } = req.body;
  const { includeArchived = false } = req.query;
  
  if (!uid) {
    return res.status(400).json({ success: false, message: "uid is required" });
  }

  try {
    const matchStage = { uid };
    if (includeArchived !== 'true' && includeArchived !== true) {
      matchStage.isActive = { $ne: false };
    }

    const summary = await machineRegModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "rentals",
          localField: "Machine_id",
          foreignField: "machineId",
          as: "rentalsData"
        }
      },
      {
        $lookup: {
          from: "maintenances",
          localField: "Machine_id",
          foreignField: "machineId",
          as: "maintenanceData"
        }
      },
      {
        $addFields: {
          calculatedTotalAmount: {
            $reduce: {
              input: "$rentalsData",
              initialValue: 0,
              in: { $add: ["$$value", { $add: [{ $ifNull: ["$$this.paidAmount", 0] }, { $ifNull: ["$$this.pendingAmount", 0] }] }] }
            }
          },
          totalPaidAmount: {
            $reduce: {
              input: "$rentalsData",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.paidAmount", 0] }] }
            }
          },
          totalPendingAmount: {
            $reduce: {
              input: "$rentalsData",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.pendingAmount", 0] }] }
            }
          },
          calculatedTotalWork: {
            $reduce: {
              input: "$rentalsData",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] }
            }
          },
          totalIncome: {
            $reduce: {
              input: {
                $filter: {
                  input: "$maintenanceData",
                  as: "m",
                  cond: { $eq: ["$$m.type", "income"] }
                }
              },
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.amount", 0] }] }
            }
          },
          totalExpense: {
            $reduce: {
              input: {
                $filter: {
                  input: "$maintenanceData",
                  as: "m",
                  cond: { $eq: ["$$m.type", "expense"] }
                }
              },
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.amount", 0] }] }
            }
          }
        }
      },
      {
        $project: {
          rentalsData: 0, // Exclude heavy raw data
          maintenanceData: 0
        }
      }
    ]);

    // Send array directly to match existing component logic which checks Array.isArray(response.data)
    res.status(200).json(summary); 
  } catch (error) {
    console.error("Error in getMachineSummaryByUid:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
