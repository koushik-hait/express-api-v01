import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../auth/user.models.js";

const followSchema = new Schema(
  {
    // The one who follows
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // The one who is being followed
    followeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

followSchema.plugin(mongooseAggregatePaginate);

export const BlogFollow = mongoose.model("BlogFollow", followSchema);
