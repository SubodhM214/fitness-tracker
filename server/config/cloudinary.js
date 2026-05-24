import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// where and how to store uploaded images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fitness-tracker/progress",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, quality: "auto" }],
  },
});

export const upload = multer({ storage });
export default cloudinary;
