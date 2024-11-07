import { User } from "../../models/auth/user.models.js";
import { Category } from "../../models/blog-app/category.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

export const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await Category.create({
      name,
      owner: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newCategory, "Category created successfully"));
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
});

export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({}).exec();
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

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { page, limit, status, email, role, username } = req.query;
    const usersAggregate = User.aggregate([
      {
        $match: {
          // deleted: status,
          // email: email,
          role: role,
          // $or: [{ username: { $regex: `${username}`, $options: "i" } }],
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "owner",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const payload = await User.aggregatePaginate(
      usersAggregate,
      getMongoosePaginationOptions({
        limit,
        page,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      })
    );

    // console.log(payload);

    if (!payload) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "No users found!...."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, payload, "All Users successfully fetched..."));
  } catch (error) {
    console.log(error);
  }
});

export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const { page, limit, status, deleted, tag, category, author, publishedAt } =
      req.query;

    console.log(req.query);

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Create a match object based on the query parameters
    const matchConditions = {};

    // Check for each parameter and add it to the matchConditions if it exists
    if (status) {
      matchConditions.status = status;
    }
    if (deleted) {
      matchConditions.deleted = deleted === "true"; // Assuming deleted is a boolean
    }
    if (category) {
      matchConditions.category = category;
    }
    if (author) {
      matchConditions.author = author;
    }
    if (publishedAt) {
      // Assuming publishedAt is a date string, you may want to convert it to a Date object
      matchConditions.publishedAt = new Date(publishedAt);
    }

    const postAggregate = BlogPost.aggregate([
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $addFields: {
          author: { $first: "$author" },
        },
      },
    ]);

    const payload = await BlogPost.aggregatePaginate(
      postAggregate,
      getMongoosePaginationOptions({
        pageNumber,
        limitNumber,
        customLabels: {
          docs: "data",
          totalDocs: "totalItems",
        },
      })
    );
    console.log(payload);
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "All Post Fetched successfully..."));
  } catch (error) {
    console.log(error);
    // return res.status(500).json(new ApiError(500,"",error))
  }
});
