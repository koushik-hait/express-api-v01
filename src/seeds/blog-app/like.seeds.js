import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { BlogComment } from "../../models/blog-app/comment.models.js";
import { BlogLike } from "../../models/blog-app/like.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { LOCAL_DB_URL } from "../_constants.js";

const ENV = process.env.NODE_ENV || "development";

const db_url =
  ENV === "development"
    ? "mongodb://localhost:27017/poc_app"
    : "mongodb+srv://mongo_user:mongouser549344@cluster0.vki8qxl.mongodb.net/poc_app";

(async () => {
  await mongoose.connect(`${LOCAL_DB_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  });

  const users = await User.find({ role: "USER" });
  const posts = await BlogPost.find({ status: "PUBLISHED" });
  const comments = await BlogComment.find({});

  console.log(comments);

  const likes = await new Array(5000).fill("_").map(() => ({
    postId: posts[Math.floor(Math.random() * posts.length)]._id,
    commentId: comments[Math.floor(Math.random() * comments.length)]._id,
    likedBy: users[Math.floor(Math.random() * users.length)]._id,
  }));

  await BlogLike.deleteMany({});
  await BlogLike.insertMany(likes);
  console.log("Likes seeded successfully");
  mongoose.connection.close();
  process.exit(0);
})();
