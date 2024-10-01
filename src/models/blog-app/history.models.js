//blog history model?

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../auth/user.models.js";

const historySchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

historySchema.plugin(mongooseAggregatePaginate);

export const BlogHistory = mongoose.model("BlogHistory", historySchema);
