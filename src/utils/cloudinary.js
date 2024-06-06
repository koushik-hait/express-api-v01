import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = async (filePath, folder) => {
  try {
    // console.log("filePath: ", filePath);
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: folder ? folder : "temp",
      public_id: filePath,
    });

    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    console.log("error: ", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    console.log("error: ", error);
    return null;
  }
};

export { deleteFromCloudinary, uploadToCloudinary };
