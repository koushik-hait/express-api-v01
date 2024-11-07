import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    image: {
      original: {
        url: {
          type: String,
          default: null,
        },
        uploadKey: {
          type: String,
          default: null,
        },
      },
      processed: {
        url: {
          type: String,
          default: null,
        },
        uploadKey: {
          type: String,
          default: null,
        },
      },
    },
    metadata: {
      type: Object,
      default: null,
    },
    transformations: {
      type: Object,
      default: null,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

imageSchema.plugin(mongooseAggregatePaginate);

export const Image = mongoose.model("Image", imageSchema);
