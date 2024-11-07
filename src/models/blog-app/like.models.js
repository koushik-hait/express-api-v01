//blog post like model

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../auth/user.models.js";
import { BlogComment } from "./comment.models.js";
import { BlogPost } from "./post.models.js";

const likeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      default: null,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "BlogComment",
      default: null,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

likeSchema.index({ postId: 1, likedBy: 1 }, { unique: true });

likeSchema.plugin(mongooseAggregatePaginate);

export const BlogLike = mongoose.model("BlogLike", likeSchema);
