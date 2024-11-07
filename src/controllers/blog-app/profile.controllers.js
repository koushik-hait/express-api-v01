import { UserProfile } from "../../models/auth/profile.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";

/*
    @route GET /api/v1/profiles/me
    @desc Get current user profile
    @access Private
*/
export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const profileAggregate = UserProfile.aggregate([
      {
        $match: { owner: req.user?._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "account",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "blogposts",
          localField: "owner",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "blogcomments",
          localField: "owner",
          foreignField: "author",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "blogfollows",
          localField: "owner",
          foreignField: "followerId",
          as: "following",
        },
      },
      {
        $lookup: {
          from: "blogfollows",
          localField: "owner",
          foreignField: "followeeId",
          as: "followers",
        },
      },
      {
        $addFields: {
          account: { $first: "$account" },
          following: { $size: "$following" },
          followers: { $size: "$followers" },
          posts: { $size: "$posts" },
          comments: { $size: "$comments" },
        },
      },
      // { $replaceRoot: { newRoot: "$account" } },
    ]);

    const payload = await UserProfile.aggregatePaginate(profileAggregate, {
      ...getMongoosePaginationOptions({
        limit: parseInt(req.query.limit, 10) || 10,
        page: parseInt(req.query.page, 10) || 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
        populate: ["user", "posts", "comments", "followers"],
      }),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Current user fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

/*
    @route GET /api/v1/profiles/:username
    @desc Get profile by username
    @access Public
*/
export const getProfileByUserName = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.aggregate([
      {
        $match: {
          username,
        },
      },
    ]);

    if (!profile) {
      throw new ApiError(404, "Profile not found");
    }

    const payload = await UserProfile.aggregatePaginate(profile, {
      ...getMongoosePaginationOptions({
        limit: parseInt(req.query.limit, 10) || 10,
        page: parseInt(req.query.page, 10) || 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Profile fetched successfully"));
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

/*
    @route PUT /api/v1/profiles
    @desc Update user profile
    @access Private

    @route PATCH /api/v1/profiles
    @desc Update user profile
    @access Private

    FIXME: for avatar and a cloudinary upload many field missing in req.body

*/
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { owner: req.user?._id },
      { name, bio, avatar },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, profile, "Profile updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

/*
    @route PUT /api/v1/profiles/cover-image
    @desc Update user profile cover image
    @access Private
FIXME: add validation for cover image and a cloudinary upload
*/
export const updateCoverImage = asyncHandler(async (req, res) => {
  try {
    const { coverImage } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { owner: req.user?._id },
      { coverImage },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, profile, "Profile updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

/**
 * @api {get} /top/5/users Get top 5 users
 * @apiName GetTop5Users
 * @apiGroup Blog App
 *
 * @apiSuccess {Object[]} users Users list
 */
export const getTop5Users = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const useraggregate = UserProfile.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "blogposts",
          localField: "owner",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $lookup: {
          from: "blogfollows",
          localField: "owner",
          foreignField: "followeeId",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "blogfollows",
          localField: "owner",
          foreignField: "followeeId",
          as: "isFollowing",
          pipeline: [
            {
              $match: {
                followerId: validateMongoId(currentUserId),
              },
            },
          ],
        },
      },
      {
        $addFields: {
          account: { $first: "$account" },
          followers: { $size: "$followers" },
          posts: { $size: "$posts" },
          isFollowing: {
            $cond: {
              if: {
                $gte: [
                  {
                    // if the isFollowing key has document in it
                    $size: "$isFollowing",
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
      { $sort: { followers: -1, posts: -1 } },
      { $limit: 5 },
    ]);

    const payload = await UserProfile.aggregatePaginate(useraggregate, {
      ...getMongoosePaginationOptions({
        limit: parseInt(req.query.limit, 10) || 10,
        page: parseInt(req.query.page, 10) || 1,
        customLabels: {
          totalDocs: "totalItems",
          docs: "data",
        },
      }),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, payload, "Top 5 users fetched successfully"));
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
