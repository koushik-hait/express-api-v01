import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    const filePath = req.file?.path;
    const fileUrl = await uploadToCloudinary(filePath);
    console.log("fileUrl: ", fileUrl, "localPath: ", filePath);

    if (!fileUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fileUrl: fileUrl.secure_url },
          "File uploaded successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
};
