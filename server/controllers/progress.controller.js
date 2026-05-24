import Progress from "../models/Progress.js";
import cloudinary from "../config/cloudinary.js";

// POST /api/progress/upload
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const progress = await Progress.create({
      user: req.user._id,
      photoUrl: req.file.path,
      cloudinaryId: req.file.filename,
      note: req.body.note || "",
      weight: req.body.weight || null,
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// GET /api/progress
export const getProgress = async (req, res) => {
  try {
    const photos = await Progress.find({ user: req.user._id }).sort({
      date: -1,
    }); // newest first

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/progress/:id
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Progress.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // make sure photo belongs to logged in user
    if (photo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorised" });
    }

    // delete from cloudinary
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    // delete from MongoDB
    await photo.deleteOne();

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
