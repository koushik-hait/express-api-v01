import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/errors.js";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Only image files (JPEG, PNG, GIF, WebP) are allowed", 400),
      false,
    );
  }
};

// File filter for any file
const anyFilter = (req, file, cb) => {
  cb(null, true);
};

// Base multer configuration
const baseConfig = {
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
};

/**
 * Upload single image
 */
export const uploadSingleImage = multer({
  ...baseConfig,
  fileFilter: imageFilter,
}).single("image");

/**
 * Upload multiple images (max 10)
 */
export const uploadMultipleImages = multer({
  ...baseConfig,
  fileFilter: imageFilter,
}).array("images", 10);

/**
 * Upload product images (featured + gallery)
 */
export const uploadProductImages = multer({
  ...baseConfig,
  fileFilter: imageFilter,
}).fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

/**
 * Upload single file (any type)
 */
export const uploadSingleFile = multer({
  ...baseConfig,
  fileFilter: anyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for general files
  },
}).single("file");

/**
 * Upload user avatar
 */
export const uploadAvatar = multer({
  ...baseConfig,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
  },
}).single("avatar");

/**
 * Get file URL from uploaded file
 */
export const getFileUrl = (file) => {
  if (!file) return null;
  return `/uploads/${file.filename}`;
};

/**
 * Get file URLs from multiple uploaded files
 */
export const getFileUrls = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/${file.filename}`);
};

/**
 * Middleware to handle multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("File size too large", 400));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new AppError("Too many files", 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};
