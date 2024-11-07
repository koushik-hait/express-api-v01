import { v4 as uuidv4 } from "uuid";
import { BlogComment } from "../../models/blog-app/comment.models.js";
import { BlogLike } from "../../models/blog-app/like.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
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
    postId: pid,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await BlogLike.findOneAndDelete({
      postId: pid,
      likedBy: req.user?._id,
    });
    const likeCount = await BlogLike.find({ postId: pid }).countDocuments();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: false,
          likes: likeCount,
        },
        "Unliked successfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await BlogLike.create({
      postId: pid,
      likedBy: req.user?._id,
    });
    const likeCount = await BlogLike.find({ postId: pid }).countDocuments();
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: true,
          likes: likeCount,
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
    commentId: cid,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await BlogLike.findOneAndDelete({
      commentId: cid,
      likedBy: req.user?._id,
    });
    const likeCount = await BlogLike.find({ commentId: cid }).countDocuments();
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: false,
          likes: likeCount,
        },
        "Unliked successfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await BlogLike.create({
      commentId: cid,
      likedBy: req.user?._id,
    });

    const likeCount = await BlogLike.find({ commentId: cid }).countDocuments();
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: true,
          likes: likeCount,
        },
        "Liked successfully"
      )
    );
  }
});

export { likeDislikeComment, likeDislikePost };
