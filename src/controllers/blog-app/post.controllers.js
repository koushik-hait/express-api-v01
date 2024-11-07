// import { v4 as uuidv4 } from "uuid";
// import { deleteCached, getCached, setCached } from "../../db/redis-config.js";
import { uploadToCloudinary } from "../../libs/cloudinary.js";
import { BlogPost as Blog } from "../../models/blog-app/post.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
// import { postAggregator } from "../../utils/blog.helpers.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

/**
 * @param {import("express").Request} req
 * @description Utility function which returns the pipeline stages to structure the blog post schema with calculations like, likes count, comments count, isLiked, isBookmarked etc
 * @returns {mongoose.PipelineStage[]}
 */
const postCommonAggregation = (uid) => {
  return [
    {
      $lookup: {
        from: "blogcomments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "bloglikes",
        localField: "_id",
        foreignField: "postId",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "blogbookmarks",
        localField: "_id",
        foreignField: "postId",
        as: "bookmarks",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
        pipeline: [
          {
            $project: {
              owner: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "bloglikes",
        localField: "_id",
        foreignField: "postId",
        as: "isLiked",
        pipeline: [
          {
            $match: {
              likedBy: uid ? validateMongoId(uid) : null,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "blogbookmarks",
        localField: "_id",
        foreignField: "postId",
        as: "isBookmarked",
        pipeline: [
          {
            $match: {
              bookmarkedBy: uid ? validateMongoId(uid) : null,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        localField: "author",
        foreignField: "owner",
        as: "author",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "account",
              pipeline: [
                {
                  $project: {
                    avatar: 1,
                    email: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          { $addFields: { account: { $first: "$account" } } },
        ],
      },
    },
    {
      $addFields: {
        author: { $first: "$author" },
        category: { $first: "$category" },
        likes: { $size: "$likes" },
        bookmarks: { $size: "$bookmarks" },
        comments: { $size: "$comments" },
        isLiked: {
          $cond: {
            if: {
              $gte: [
                {
                  // if the isLiked key has document in it
                  $size: "$isLiked",
                },
                1,
              ],
            },
            then: true,
            else: false,
          },
        },
        isBookmarked: {
          $cond: {
            if: {
              $gte: [
                {
                  // if the isBookmarked key has document in it
                  $size: "$isBookmarked",
                },
                1,
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ];
};

export const addBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, description, status, tags, category } = req.body;
    const coverPhotoPath = req.files?.coverPhoto?.[0]?.path;

    const coverPhotoUrl = await uploadToCloudinary(coverPhotoPath, "blogs");

    if (!coverPhotoUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const newBlog = await Blog.create({
      title,
      content,
      description,
      status,
      coverImage: coverPhotoUrl.secure_url,
      author: req.user._id,
      tags: JSON.parse(tags) || [],
      category: category,
      publishedAt: status === "PUBLISHED" ? Date.now() : null,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newBlog, "Blog created successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

export const updatePost = asyncHandler(async (req, res) => {
  try {
    const { title, content, description, publishStatus } = req.body;
    const coverPhotoPath = req.files?.coverPhoto?.[0]?.path;
    const coverPhotoUrl = await uploadToCloudinary(coverPhotoPath);
    if (!coverPhotoUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.pid,
      {
        title,
        content,
        description,
        publishStatus,
        coverImage: coverPhotoUrl.secure_url,
        publishedAt: publishStatus === "PUBLISHED" ? Date.now() : null,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog updated successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

export const deletePost = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.pid);
    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog deleted successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    const uid = req.user?._id;

    // const cachedPost = await getCached(
    //   `/api/v1/blog/all?page=${page}&limit=10`
    // );

    // if (cachedPost) {
    //   return res
    //     .status(200)
    //     .json(
    //       new ApiResponse(
    //         200,
    //         cachedPost,
    //         "Blogs fetched successfully from Cached data"
    //       )
    //     );
    // }

    const postAggregate = Blog.aggregate([
      {
        $match: {
          status: "PUBLISHED",
          deleted: false,
        },
      },
      // ...postAggregator(uid),
      ...postCommonAggregation(uid),
    ]);

    const payload = await Blog.aggregatePaginate(
      postAggregate,
      getMongoosePaginationOptions({
        limit,
        page,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      })
    );

    if (!payload) {
      return res.status(404).json(new ApiResponse(404, null, "No blog found"));
    }

    // await setCached(`/api/v1/blog/all?page=${page}&limit=10`, payload);

    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

export const getPostById = asyncHandler(async (req, res) => {
  try {
    const { pid } = req.params;
    const uid = req.user?._id;
    const blog = Blog.aggregate([
      {
        $match: {
          _id: validateMongoId(pid),
        },
      },
      ...postCommonAggregation(uid),
    ]);

    const payload = await Blog.aggregatePaginate(blog, {
      ...getMongoosePaginationOptions({
        limit: 1,
        page: 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blog fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 * @api {get} /users/:uid/posts Get blogs by user
 * @apiName getPostssByUser
 * @apiGroup Posts
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 *
 */
export const getPostsByUser = asyncHandler(async (req, res) => {
  try {
    const { uid } = req.params;
    const payload = await Blog.find({ author: uid });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 * Search blog
 * @api {get} /search Search blog
 * @apiName Search
 * @apiGroup Blog
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 *
 */
export const search = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const uid = req.user?._id;
    if (!q) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Search query is required"));
    }

    const postAggregate = Blog.aggregate([
      {
        $match: {
          status: "PUBLISHED",
          deleted: false,
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        },
      },
      ...postCommonAggregation(uid),
    ]);

    const payload = await Blog.aggregatePaginate(postAggregate, {
      ...getMongoosePaginationOptions({
        limit,
        page,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });

    if (!payload) {
      return res.status(404).json(new ApiResponse(404, null, "No blog found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 * @api {get} /get/d/:date/posts Get Posts By Date
 * @apiName getPostsByDate
 * @apiGroup Posts
 *
 * @apiParam {String} date Date in format YYYY-MM-DD
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getPostsByDate = asyncHandler(async (req, res) => {
  try {
    const { date } = req.params;
    const payload = await Blog.find({ publishedAt: { $gte: date } });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 *
 *
 * @api {get} /get/:category/posts Get Posts By Category
 * @apiName getPostsByCategory
 * @apiGroup Posts
 *
 * @apiParam {String} category Category
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getPostsByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const payload = await Blog.find({ category });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 *
 *
 * @api {get} /get/:username/posts Get Posts By Username
 * @apiName getPostsByUsername
 * @apiGroup Posts
 *
 * @apiParam {String} username Username
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getPostsByUsername = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const payload = await Blog.find({ author: username });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json();
  }
});

/**
 *
 *
 * @api {get} /get/t/:tag/posts Get Posts By Tag
 * @apiName getPostsByTag
 * @apiGroup Posts
 *
 * @apiParam {String} tag Tag
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getPostsByTag = asyncHandler(async (req, res) => {
  try {
    const { tag } = req.params;
    const payload = await Blog.find({ tags: tag });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 *
 * @api {delete} /remove/image/:postId/:imageId Remove Post Image
 * @apiName removePostImage
 * @apiGroup Posts
 *
 * @apiParam {String} postId Post Id
 * @apiParam {String} imageId Image Id
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 *
 */
export const removePostImage = asyncHandler(async (req, res) => {
  const { postId, imageId } = req.params;
  const payload = await Blog.findById(postId);
  if (!payload) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No blog found with this id"));
  }
  const imageIndex = payload.images.indexOf(imageId);
  if (imageIndex === -1) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No image found with this id"));
  }
  payload.images.splice(imageIndex, 1);
  await payload.save();
  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Image removed successfully"));
});

/**
 * @api {get} /recent/5/posts Get Recent Posts
 * @apiName getRecentPosts
 * @apiGroup Posts
 *
 * @apiParam {Number} limit Limit
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getRecentPosts = asyncHandler(async (req, res) => {
  try {
    const x = parseInt(req.params.x, 10) || 5;
    const uid = req.user?._id;
    const postAggregate = Blog.aggregate([
      {
        $match: {
          status: "PUBLISHED",
          deleted: false,
        },
      },
      ...postCommonAggregation(uid),
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const payload = await Blog.aggregatePaginate(postAggregate, {
      ...getMongoosePaginationOptions({
        limit: x,
        page: 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});

/**
 * @api {get} /trending/5/posts Get Popular Posts
 * @apiName getPopularPosts
 * @apiGroup Posts
 *
 * @apiParam {Number} limit Limit
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getTrendingPosts = asyncHandler(async (req, res) => {
  try {
    const x = parseInt(req.params.x, 10) || 5;
    const uid = req.user?._id;
    const postAggregate = Blog.aggregate([
      {
        $match: {
          status: "PUBLISHED",
          deleted: false,
        },
      },
      ...postCommonAggregation(uid),
      {
        $sort: {
          likes: -1,
          bookmarks: -1,
        },
      },
    ]);

    const payload = await Blog.aggregatePaginate(
      postAggregate,
      getMongoosePaginationOptions({
        limit: x,
        page: 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      })
    );
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Blogs fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
});
