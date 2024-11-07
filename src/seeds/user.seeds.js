import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";
import mongoose from "mongoose";
import { AvailableUserRoles } from "../constants.js";
import { users } from "../db/schema/user.js";
import { UserProfile } from "../models/auth/profile.models.js";
import { User } from "../models/auth/user.models.js";
import { genEncryptedPassword } from "../utils/helper.js";
import { USERS_COUNT } from "./_constants.js";
const db = drizzle("postgresql://testuser:test12345@localhost:5432/test_db");

const ENV = process.env.NODE_ENV || "development";

// const db_url =
//   ENV === "development"
//     ? "mongodb://localhost:27017/poc_app"
//     : "mongodb+srv://mongo_user:mongouser549344@cluster0.vki8qxl.mongodb.net/poc_app";

// Array of fake users
const newUsers = new Array(500).fill("_").map(() => ({
  avatar: {
    url: faker.image.avatar(),
    localPath: "",
  },
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: genEncryptedPassword("123456"),
  isEmailVerified: faker.helpers.arrayElement([true, false]),
  role: faker.helpers.arrayElement(["user", "admin"]),
}));

const seedUsers = async () => {
  try {
    // await mongoose.connect(`${db_url}`, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   // useFindAndModify: false,
    //   // useCreateIndex: true,
    // });

    await db.insert(users).values(newUsers);
    // await User.deleteMany({});
    // await User.insertMany(users);
    console.log("Users seeded successfully");
    // mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Error seeding users: ", error);
    process.exit(1);
  }
};

seedUsers();
