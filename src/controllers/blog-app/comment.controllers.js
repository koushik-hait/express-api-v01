import { v4 as uuidv4 } from "uuid";
import { emitSocketEvent } from "../../libs/socket/index.js";
import { BlogComment } from "../../models/blog-app/comment.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

/**
 * @api {post} /comment/create Create Comment
 * @apiName addComment
 * @apiGroup BlogComment
 * @apiParam {String} content
 * @apiParam {String} author
 * @apiParam {String} postId
 */
export const addComment = asyncHandler(async (req, res) => {
  try {
    const { content, author, postId } = req.body;
    const { limit, page } = req.query;

    const newComment = await BlogComment.create({
      content,
      author,
      postId,
    });
    const commentsAggregate = BlogComment.aggregate([
      {
        $match: {
          postId: validateMongoId(postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "bloglikes",
          localField: "_id",
          foreignField: "commentId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "bloglikes",
          localField: "_id",
          foreignField: "commentId",
          as: "isLiked",
          pipeline: [
            {
              $match: {
                likedBy: uid,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          author: { $first: "$author" },
          likes: { $size: "$likes" },
          isLiked: {
            $cond: {
              if: {
                $gte: [
                  {
                    // if the isLiked key has document in it
                    $size: "$isLiked",
                  },
                  1,
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    const payload = await BlogComment.aggregatePaginate(commentsAggregate, {
      ...getMongoosePaginationOptions({
        limit: parseInt(limit, 10) || 10,
        page: parseInt(page, 10) || 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });
    // console.log(payload);
    emitSocketEvent(req, postId, "NEW_COMMENT", payload);
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

//   updateComment,
/**
 * @api {put} /comment/:cid Update Comment
 * @ApiName updateComment
 * @ApiGroup BlogComment
 * @ApiParam {String} cid
 * @ApiParam {String} content
 * @ApiParam {String} author
 * @ApiParam {String} postId
 */
export const updateComment = asyncHandler(async (req, res) => {
  try {
    const { cid } = req.params;
    const { content, author, postId } = req.body;
    const payload = await BlogComment.findByIdAndUpdate(cid, {
      content,
      author,
      postId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Comment updated successfully"));
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

/**
 * @api {get} /comment/:pid Get Post Comments
 * @apiName getPostComments
 * @apiGroup BlogComment
 * @apiParam {String} pid
 * @apiParam {Number} limit
 * @apiParam {Number} page
 */
export const getPostComments = asyncHandler(async (req, res) => {
  try {
    const uid = req.user._id ? validateMongoId(req.user._id) : null;
    const { pid } = req.params;
    const { limit, page } = req.query;
    const commentsAggregate = BlogComment.aggregate([
      {
        $match: {
          postId: validateMongoId(pid),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "bloglikes",
          localField: "_id",
          foreignField: "commentId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "bloglikes",
          localField: "_id",
          foreignField: "commentId",
          as: "isLiked",
          pipeline: [
            {
              $match: {
                likedBy: uid,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          author: { $first: "$author" },
          likes: { $size: "$likes" },
          isLiked: {
            $cond: {
              if: {
                $gte: [
                  {
                    // if the isLiked key has document in it
                    $size: "$isLiked",
                  },
                  1,
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const payload = await BlogComment.aggregatePaginate(commentsAggregate, {
      ...getMongoosePaginationOptions({
        limit: parseInt(limit, 10) || 10,
        page: parseInt(page, 10) || 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });
    if (!payload) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No comments found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Comments fetched successfully"));
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

/**
 * @api {delete} /comment/:cid Delete Comment
 * @apiName deleteComment
 * @apiGroup BlogComment
 * @apiParam {String} cid
 * @apiParam {String} pid
 */
export const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { cid } = req.params;
    const comment = await BlogComment.findByIdAndDelete(cid);
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment deleted successfully"));
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

/**
 * @api {get} /comment/:cid Get Comment
 * @apiName getComment
 * @apiGroup BlogComment
 * @apiParam {String} cid
 */
export const getCommentById = asyncHandler(async (req, res) => {
  try {
    const { cid } = req.params;
    const comment = await BlogComment.findById(cid).exec();
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment fetched successfully"));
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
