import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { Category } from "../../models/blog-app/category.models.js";

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

  const users = await User.find({ role: "ADMIN" });

  const categories = await new Array(500).fill("_").map(() => ({
    name: faker.hacker.noun(),
    owner: users[Math.floor(Math.random() * users.length)]._id,
  }));

  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log("categories seeded successfully");
  mongoose.connection.close();
  process.exit(0);
})();
