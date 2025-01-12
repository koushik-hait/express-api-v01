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
    const categories = await Category.find({}).select("name").exec();
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

export const getAllTags = asyncHandler(async (req, res) => {
  try {
    const tags = await BlogPost.distinct("tags").exec();
    return res
      .status(200)
      .json(new ApiResponse(200, tags, "Categories fetched successfully"));
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
    const {
      page,
      limit,
      status,
      deleted,
      tag,
      category,
      author,
      publishedFrom,
      publishedTo,
      sortBy,
      sortDirection,
    } = req.query;

    // Extracting date range from query parameters
    const startDate = req.query.publishedFrom
      ? new Date(req.query.publishedFrom)
      : null;
    const endDate = req.query.publishedTo
      ? new Date(req.query.publishedTo)
      : null;

    // Create a match object based on the query parameters
    const matchConditions = {};

    // Check for each parameter and add it to the matchConditions if it exists
    if (status) {
      matchConditions.status = status;
    }
    if (tag) {
      matchConditions.tags = { $in: [tag] };
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
    if (startDate && endDate) {
      matchConditions.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      matchConditions.createdAt = { $gte: startDate };
    } else if (endDate) {
      matchConditions.createdAt = { $lte: endDate };
    }

    const postAggregate = BlogPost.aggregate([
      {
        $match: {
          ...matchConditions,
        },
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
      {
        $sort: { [sortBy]: sortDirection ? 1 : -1 }, // Sort by the specified field and direction
      },
    ]);

    const payload = await BlogPost.aggregatePaginate(
      postAggregate,
      getMongoosePaginationOptions({
        page,
        limit,
        customLabels: {
          docs: "data",
          totalDocs: "totalItems",
        },
      })
    );
    // console.log(payload);
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "All Post Fetched successfully..."));
  } catch (error) {
    console.log(error);
    // return res.status(500).json(new ApiError(500,"",error))
  }
});
