import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { BlogBookmark } from "../../models/blog-app/bookmark.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";

const ENV = process.env.NODE_ENV || "development";

const db_url =
  ENV === "development"
    ? "mongodb://localhost:27017/poc_app"
    : "mongodb+srv://mongo_user:mongouser549344@cluster0.vki8qxl.mongodb.net/poc_app";

(async () => {
  await mongoose.connect(`${db_url}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  });

  const users = await User.find({ role: "USER" });
  const posts = await BlogPost.find({ status: "PUBLISHED" });

  const bookmarks = await new Array(5000).fill("_").map(() => ({
    postId: posts[Math.floor(Math.random() * posts.length)]._id,
    bookmarkedBy: users[Math.floor(Math.random() * users.length)]._id,
  }));

  await BlogBookmark.deleteMany({});
  await BlogBookmark.insertMany(bookmarks);
  console.log("bookmarks seeded successfully");
  mongoose.connection.close();
  process.exit(0);
})();
