import mongoose from "mongoose";

const ProgressSchema=mongoose.Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoUrl: {
    type: String,
    required: true        // cloudinary URL
  },
  cloudinaryId: {
    type: String,
    required: true        // needed to delete from cloudinary later
  },
  note: {
    type: String,
    default: ''           // optional note eg. "feeling stronger today"
  },
  weight: {
    type: Number,
    default: null         // optional weight log on that day
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })
export default mongoose.model('Progress',ProgressSchema);