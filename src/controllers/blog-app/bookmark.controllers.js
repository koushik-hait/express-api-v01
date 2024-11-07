import { v4 as uuidv4 } from "uuid";
import { BlogBookmark } from "../../models/blog-app/bookmark.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

// getBookMarkedPosts,
/**
 * @api {get} /api/v1/bookmarks Get Bookmarked Posts
 * @apiName GetBookmarkedPosts
 * @apiGroup Blog App
 *
 * @apiSuccess {Object[]} posts List of posts
 */

export const getBookMarkedPosts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id;
    const bookmarkAggregate = BlogBookmark.aggregate([
      {
        $match: {
          bookmarkedBy: validateMongoId(userId),
        },
      },
      {
        $lookup: {
          from: "blogposts",
          localField: "postId",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $addFields: {
          post: { $first: "$post" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$post",
        },
      },
    ]);

    const payload = await BlogBookmark.aggregatePaginate(bookmarkAggregate, {
      ...getMongoosePaginationOptions({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        customLabels: {
          docs: "data",
          totalDocs: "totalItems",
        },
      }),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Bookmarks fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(500, null, error.message));
  }
});

/**
 * @api {post} /api/v1/bookmarks/:pid Bookmark Unbookmark Post
 * @apiName BookmarkUnBookmarkPost
 * @apiGroup Blog App
 *
 * @apiParam {string} pid Post Id
 *
 * @apiSuccess {Object} post Post
 */

export const bookmarkUnBookmarkPost = asyncHandler(async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user?._id.toString();
    const post = await BlogPost.findById({ _id: validateMongoId(pid) });
    if (!post) {
      throw new ApiError(404, "Post Does not exits");
    }

    // console.log(pid, userId, post);

    const isAlreadyBookmarked = await BlogBookmark.findOne({
      postId: validateMongoId(pid),
      bookmarkedBy: validateMongoId(userId),
    });
    // console.log("isAlreadybookmarked", isAlreadyBookmarked);
    if (isAlreadyBookmarked) {
      await BlogBookmark.findByIdAndDelete({
        _id: isAlreadyBookmarked?._id,
      });
      const bookmarkCount = await BlogBookmark.find({
        postId: validateMongoId(pid),
      }).countDocuments();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isBookmarked: false, bookmarks: bookmarkCount },
            "Removed From bookmark list Successfully."
          )
        );
    } else {
      await BlogBookmark.create({ postId: pid, bookmarkedBy: userId });
      const bookmarkCount = await BlogBookmark.find({
        postId: validateMongoId(pid),
      }).countDocuments();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isBookmarked: true, bookmarks: bookmarkCount },
            "Bookmarked Successfully."
          )
        );
    }
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(500, null, error.message));
  }
});
