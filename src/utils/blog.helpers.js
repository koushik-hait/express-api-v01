import {validateMongoId} from "./helper.js";


export const postAggregator = (uid) => {
  const validatedUid = uid ? validateMongoId(uid) : null;

  return [
    // Add any initial $match stage here if possible
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        let: { authorId: "$author" },
        pipeline: [
          { $match: { $expr: { $eq: ["$owner", "$$authorId"] } } },
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
          { $addFields: { account: { $arrayElemAt: ["$account", 0] } } },
        ],
        as: "author",
      },
    },
    {
      $lookup: {
        from: "blogcomments",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
          { $count: "count" },
        ],
        as: "commentCount",
      },
    },
    {
      $lookup: {
        from: "bloglikes",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
          {
            $facet: {
              count: [{ $count: "count" }],
              isLiked: [{ $match: { likedBy: validatedUid } }, { $limit: 1 }],
            },
          },
        ],
        as: "likeInfo",
      },
    },
    {
      $lookup: {
        from: "blogbookmarks",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
          {
            $facet: {
              count: [{ $count: "count" }],
              isBookmarked: [
                { $match: { bookmarkedBy: validatedUid } },
                { $limit: 1 },
              ],
            },
          },
        ],
        as: "bookmarkInfo",
      },
    },
    {
      $addFields: {
        author: { $arrayElemAt: ["$author", 0] },
        category: { $arrayElemAt: ["$category", 0] },
        comments: { $arrayElemAt: ["$commentCount.count", 0] },
        likes: { $arrayElemAt: ["$likeInfo.count.count", 0] },
        isLiked: {
          $gt: [{ $size: { $arrayElemAt: ["$likeInfo.isLiked", 0] } }, 0],
        },
        bookmarks: { $arrayElemAt: ["$bookmarkInfo.count.count", 0] },
        isBookmarked: {
          $gt: [
            { $size: { $arrayElemAt: ["$bookmarkInfo.isBookmarked", 0] } },
            0,
          ],
        },
      },
    },
    {
      $project: {
        commentCount: 0,
        likeInfo: 0,
        bookmarkInfo: 0,
      },
    },
  ];
};
