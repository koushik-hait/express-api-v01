import allCity from "../json/city.json" assert { type: "json" };
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * Retrieves the city information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getCity = async (req, res) => {
  let cityArray = structuredClone(allCity);

  return res
    .status(200)
    .json(new ApiResponse(200, cityArray, "City fetched successfully"));
};

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
