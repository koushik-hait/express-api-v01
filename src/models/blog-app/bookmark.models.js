import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// import { User } from "../auth/user.models.js";
// import { BlogPost } from "./post.models.js";

const bookmarkSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
    },
    bookmarkedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ postId: 1, bookmarkedBy: 1 }, { unique: true });

bookmarkSchema.plugin(mongooseAggregatePaginate);

export const BlogBookmark = mongoose.model("BlogBookmark", bookmarkSchema);
