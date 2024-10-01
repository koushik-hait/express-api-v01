import { v4 as uuidv4 } from "uuid";
import { BlogComment } from "../../models/blog-app/comment.models.js";
import { BlogLike } from "../../models/blog-app/like.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

const likeDislikePost = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const post = await BlogPost.findById(pid);

  // Check for post existence
  if (!post) {
    throw new ApiError(404, "Post does not exist");
  }

  // See if user has already liked the post
  const isAlreadyLiked = await BlogLike.findOne({
    pid,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await BlogLike.findOneAndDelete({
      pid,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: false,
        },
        "Unliked successfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await BlogLike.create({
      pid,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: true,
        },
        "Liked successfully"
      )
    );
  }
});

const likeDislikeComment = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  const comment = await BlogComment.findById(cid);

  // Check for comment existence
  if (!comment) {
    throw new ApiError(404, "Comment does not exist");
  }

  // See if user has already liked the comment
  const isAlreadyLiked = await BlogLike.findOne({
    cid,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await BlogLike.findOneAndDelete({
      cid,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: false,
        },
        "Unliked successfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await BlogLike.create({
      cid,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: true,
        },
        "Liked successfully"
      )
    );
  }
});

export { likeDislikeComment, likeDislikePost };
