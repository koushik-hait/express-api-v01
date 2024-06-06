import { v4 as uuidv4 } from "uuid";
import { Category } from "../../models/blog-app/category.models.js";
import { BlogComment } from "../../models/blog-app/comment.models.js";
import { BlogPost as Blog } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

export const addBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, description, status, tags, category } = req.body;
    const coverPhotoPath = req.files?.coverPhoto?.[0]?.path;

    const coverPhotoUrl = await uploadToCloudinary(coverPhotoPath, "blogs");

    if (!coverPhotoUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const newBlog = await Blog.create({
      title,
      content,
      description,
      status,
      coverImage: coverPhotoUrl.secure_url,
      author: req.user._id,
      tags: JSON.parse(tags) || [],
      category: category,
      publishedAt: status === "PUBLISHED" ? Date.now() : null,
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

export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, description, publishStatus } = req.body;
    const coverPhotoPath = req.files?.coverPhoto?.[0]?.path;
    const coverPhotoUrl = await uploadToCloudinary(coverPhotoPath);
    if (!coverPhotoUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.pid,
      {
        title,
        content,
        description,
        publishStatus,
        coverImage: coverPhotoUrl.secure_url,
        publishedAt: publishStatus === "PUBLISHED" ? Date.now() : null,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog updated successfully"));
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

export const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.pid);
    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog deleted successfully"));
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
    const blog = await Blog.findById(req.params.pid)
      .populate({ path: "author", select: "_id username avatar" })
      .exec();
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

export const addComment = asyncHandler(async (req, res) => {
  try {
    const { content, author, postId } = req.body;
    const newComment = await BlogComment.create({
      content,
      author,
      postId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment created successfully"));
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

export const getAllPostComments = asyncHandler(async (req, res) => {
  try {
    const comments = await BlogComment.find({ postId: req.params.pid })
      .populate({
        path: "author",
        select: "_id username avatar",
      })
      .exec();
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
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

export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().exec();
    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories fetched successfully")
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
});
