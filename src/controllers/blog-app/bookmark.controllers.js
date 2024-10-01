import { v4 as uuidv4 } from "uuid";
import { BlogBookmark } from "../../models/blog-app/bookmark.models.js";
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
    const options = getMongoosePaginationOptions(page, limit);
    const bookmarks = await BlogBookmark.find(
      { bookmarks: req.user?._id },
      null,
      options
    );
    return res
      .status(200)
      .json(new ApiResponse(200, bookmarks, "Bookmarks fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(500, null, error.message));
  }
});

// bookmarkUnBookmarkPost;
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
    const post = await BlogBookmark.findOneAndUpdate(
      { _id: pid },
      { $pull: { bookmarks: req.user?._id } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post bookmarked successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(500, null, error.message));
  }
});
