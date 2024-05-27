//mongoose schema
import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "https://via.placeholder.com/300x200.png",
    },
    //TODO: Add owner and tags, category fields here
    // owner: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    // },
    // tags: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Tag",
    //   },
    // ],
    // category: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Category",
    // },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
