import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { User } from "../models/auth/user.models.js";
import { BlogComment } from "../models/blog-app/comment.models.js";
import { BlogPost } from "../models/blog-app/post.models.js";
import { COMMENT_COUNT } from "./_constants.js";

const seedComments = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://mongo_user:mongouser549344@cluster0.vki8qxl.mongodb.net/poc_app`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
      }
    );

    const users = await User.find({ role: "USER" });
    if (users.length === 0) {
      console.log("users not found");
      return;
    }

    const posts = await BlogPost.find({ status: "PUBLISHED" }).populate(
      "author"
    );
    if (posts.length === 0) {
      console.log("posts not found");
      return;
    }

    // Array of fake posts
    const comments = await new Array(COMMENT_COUNT).fill("_").map(() => ({
      content: faker.lorem.paragraph(),
      postId: posts[Math.floor(Math.random() * posts.length)]._id,
      author: users[Math.floor(Math.random() * users.length)]._id,
    }));

    await BlogComment.deleteMany();
    await BlogComment.insertMany(comments);
    console.log("Comments seeded successfully");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Error seeding Comments: ", error);
    process.exit(1);
  }
};

seedComments();
