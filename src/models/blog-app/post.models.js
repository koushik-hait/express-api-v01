//mongoose schema
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../auth/user.models.js";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      // maxlength: [200, "Title should not exceed 200 characters"],
      // minlength: [3, "Title should not be less than 3 characters"],
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      // maxlength: [5000, "Content should not exceed 5000 characters"],
      // minlength: [3, "Content should not be less than 3 characters"],
    },
    coverImage: {
      type: String,
      default: "https://via.placeholder.com/300x200.png",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    //TODO: Add owner and tags, category fields here
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });
postSchema.index({ createdAt: -1 });

postSchema.plugin(mongooseAggregatePaginate);

export const BlogPost = mongoose.model("BlogPost", postSchema);
