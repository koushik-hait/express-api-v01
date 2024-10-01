import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { BlogFollow } from "../../models/blog-app/follow.models.js";

(async () => {
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
