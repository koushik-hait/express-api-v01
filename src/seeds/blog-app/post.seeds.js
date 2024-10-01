import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { Category } from "../../models/blog-app/category.models.js";
import { BlogPost } from "../../models/blog-app/post.models.js";
import { BLOG_CONTENT, POSTS_COUNT } from "../_constants.js";

const seedPosts = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://mongo_user:mongouser549344@cluster0.vki8qxl.mongodb.net/poc_app`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: false,
      }
    );

    const users = await User.find({ role: "USER" });
    if (users.length === 0) {
      console.log("users not found");
      return;
    }

    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log("categories not found");
      return;
    }

    // Array of fake posts
    const posts = await new Array(POSTS_COUNT).fill("_").map(() => ({
      title: faker.hacker.phrase(),
      description: faker.lorem.paragraph(),
      content: JSON.stringify(BLOG_CONTENT, null, 2),
      tags: [
        faker.helpers.arrayElement(["js", "html", "frontend", "backend"]),
        faker.helpers.arrayElement(["python", "nodejs", "mern", "react"]),
        faker.helpers.arrayElement(["design", "devops", "ui", "ux"]),
      ],
      coverImage: faker.image.urlLoremFlickr({
        width: 1200,
        height: 800,
        category: "nature",
      }),
      author: users[Math.floor(Math.random() * users.length)]._id,
      category: categories[Math.floor(Math.random() * categories.length)]._id,
      status: faker.helpers.arrayElement(["DRAFT", "PUBLISHED"]),
      publishedAt: faker.date.past(),
    }));

    await BlogPost.deleteMany();
    await BlogPost.insertMany(posts);
    console.log("Posts seeded successfully");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Error seeding posts: ", error);
    process.exit(1);
  }
};

seedPosts();
