import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { BlogFollow } from "../../models/blog-app/follow.models.js";

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

  const follows = await new Array(2000).fill("_").map(() => ({
    followerId: users[Math.floor(Math.random() * users.length)]._id,
    followeeId: users[Math.floor(Math.random() * users.length)]._id,
  }));

  await BlogFollow.deleteMany({});
  await BlogFollow.insertMany(follows);
  console.log("Follows seeded successfully");
  mongoose.connection.close();
  process.exit(0);
})();
