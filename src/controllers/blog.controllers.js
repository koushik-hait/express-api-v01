import { v4 as uuidv4 } from "uuid";
import Blog from "../models/blog.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const addBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, description, publishStatus } = req.body;
    const coverPhotoPath = req.files?.coverPhoto?.[0]?.path;

    const coverPhotoUrl = await uploadToCloudinary(coverPhotoPath);

    if (!coverPhotoUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const newBlog = await Blog.create({
      title,
      content,
      description,
      publishStatus,
      coverImage: coverPhotoUrl.secure_url,
      publishedAt: publishStatus === "PUBLISHED" ? Date.now() : null,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newBlog, "Blog created successfully"));
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
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "PUBLISHED" }).exec();
    return res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
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
});

export const getBlogById = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.bid);
    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog fetched successfully"));
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
});
