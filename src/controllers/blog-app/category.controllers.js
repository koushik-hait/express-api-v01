import { Category } from "../../models/blog-app/category.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categoryAggregation = Category.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "category",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          posts: 1,
        },
      },
    ]);

    const payload = await Category.aggregatePaginate(
      categoryAggregation,
      getMongoosePaginationOptions({
        limit: 10,
        page: 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      })
    );
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Categories fetched successfully"));
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
