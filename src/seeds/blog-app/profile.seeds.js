import { faker } from "@faker-js/faker";
import fs from "fs";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../../constants.js";
import { UserProfile } from "../../models/auth/profile.models.js";
import { User } from "../../models/auth/user.models.js";
import { genEncryptedPassword } from "../../utils/helper.js";
import { USERS_COUNT } from "../_constants.js";

const seedUserProfiles = async () => {
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

    const users = await User.find({});
    if (users.length === 0) {
      console.log("users not found");
      process.exit(1);
    }

    // Array of fake userprofiles
    const profiles = new Array(users.length).fill("_").map((v, i) => ({
      coverImage: {
        url: faker.image.urlLoremFlickr({
          width: 1440,
          height: 720,
          category: "people",
        }),
        localPath: "",
      },
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      bio: faker.person.bio(),
      dob: faker.date.past(),
      address: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      countryCode: faker.location.countryCode("alpha-3"),
      phoneNumber: faker.phone.number(),
      owner: users[i]._id,
    }));
    await UserProfile.deleteMany({});
    await UserProfile.insertMany(profiles);
    console.log("UserProfiles seeded successfully");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Error seeding userProfiles: ", error);
    process.exit(1);
  }
};

seedUserProfiles();
