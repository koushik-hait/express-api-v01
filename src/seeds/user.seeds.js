import { faker } from "@faker-js/faker";
import fs from "fs";
import mongoose from "mongoose";
import { AvailableUserRoles } from "../constants.js";
import { UserProfile } from "../models/auth/profile.models.js";
import { User } from "../models/auth/user.models.js";
import { genEncryptedPassword } from "../utils/helper.js";
import { USERS_COUNT } from "./_constants.js";

// Array of fake users
const users = new Array(USERS_COUNT).fill("_").map(() => ({
  avatar: {
    url: faker.image.avatar(),
    localPath: "",
  },
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: genEncryptedPassword("123456"),
  isEmailVerified: faker.helpers.arrayElement([true, false]),
  role: faker.helpers.arrayElement(["USER", "ADMIN"]),
  loginType: "EMAIL_PASSWORD",
}));

const seedUsers = async () => {
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
    await User.deleteMany({});
    await User.insertMany(users);
    console.log("Users seeded successfully");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Error seeding users: ", error);
    process.exit(1);
  }
};

seedUsers();
