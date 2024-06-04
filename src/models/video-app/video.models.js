import mongoose, { Schema } from "mongoose";

const dimensionEnum = ["2D", "3D"];
const definitionEnum = ["SD", "HD", "FHD", "UHD"];
const contentRatingEnum = ["G", "PG", "PG-13", "R", "NC-17"];
const projectionEnum = ["equirectangular", "cubemap", "360", "VR"];
const videoStatusEnum = ["DRAFT", "PUBLISHED"];

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title should not exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description should not exceed 500 characters"],
    },
    thumbnail: {
      original: {
        url: {
          type: String,
          required: [true, "Thumbnail URL is required"],
          default: "https://via.placeholder.com/120x90.png",
        },
        width: {
          type: Number,
          default: 120,
        },
        height: {
          type: Number,
          default: 90,
        },
      },
      medium: {
        url: {
          type: String,
          required: [true, "Thumbnail URL is required"],
          default: "https://via.placeholder.com/320x180.png",
        },
        width: {
          type: Number,
          default: 320,
        },
        height: {
          type: Number,
          default: 180,
        },
      },
      high: {
        url: {
          type: String,
          required: [true, "Thumbnail URL is required"],
          default: "https://via.placeholder.com/480x360.png",
        },
        width: {
          type: Number,
          default: 480,
        },
        height: {
          type: Number,
          default: 360,
        },
      },
      standard: {
        url: {
          type: String,
          required: [true, "Thumbnail URL is required"],
          default: "https://via.placeholder.com/640x480.png",
        },
        width: {
          type: Number,
          default: 640,
        },
        height: {
          type: Number,
          default: 480,
        },
      },
    },
    contentDetails: {
      duration: String,
      dimension: {
        type: String,
        enum: dimensionEnum,
        default: "2D",
      },
      definition: {
        type: String,
        enum: definitionEnum,
        default: "SD",
      },
      caption: {
        type: Boolean,
        default: false,
      },
      licensedContent: {
        type: Boolean,
        default: false,
      },
      contentRating: {
        type: String,
        enum: contentRatingEnum,
        default: "G",
      },
      projection: {
        type: String,
        enum: projectionEnum,
        default: "equirectangular",
      },
    },
    statistics: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      likeCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      dislikeCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    video: {
      url: {
        type: String,
        required: [true, "Video URL is required"],
      },
      localPath: {
        type: String,
        default: "",
      },
      playbackUrl: {
        type: String,
        default: "",
      },
      folder: {
        type: String,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      pix_format: {
        type: String,
        default: "",
      },
      codec: {
        type: String,
        default: "h264",
      },
      level: {
        type: String,
        default: "3.1",
      },
      profile: {
        type: String,
        default: "main",
      },
      time_base: {
        type: String,
        default: "1/90000",
      },
      frame_rate: {
        type: Number,
        default: 0,
      },
      bit_rate: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number,
        default: 0,
      },
      format: {
        type: String,
        default: "",
      },
      resource_type: {
        type: String,
        default: "upload",
      },
    },
    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: videoStatusEnum,
      default: "DRAFT",
    },
    publishedAt: Date,
    updatedAt: Date,
    createdAt: Date,

    // TODO: Add more fields here
    // categoryId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    // },
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model("Video", videoSchema);
