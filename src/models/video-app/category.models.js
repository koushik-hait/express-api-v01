import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../auth/user.models.js";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      minlength: [3, "Description must be three characters long"],
      required: [true, "Description is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

categorySchema.plugin(mongooseAggregatePaginate);

export const VideoCategory = mongoose.model("VideoCategory", categorySchema);
