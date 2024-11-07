import { User } from "../../models/auth/user.models";

/**
 * Service class for user-related operations.
 */
class UserService {
  /**
   * Finds a user by their ID.
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<Object>} The found user object.
   * @throws Will throw an error if the ID is not provided or if the user is not found.
   */
  async findUserById(id) {
    try {
      if (!id) {
        throw new Error("User ID must be provided");
      }

      const user = await User.findById(id);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error; // rethrow the error for further handling if necessary
    }
  }

  /**
   * Finds a user by their username or email.
   * @param {string} username - The username of the user to find.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<Array>} An array of user objects.
   * @throws Will throw an error if the operation fails.
   */
  async findUserByEmail(username, email) {
    try {
      const user = await User.find({
        $or: { username, email },
      });

      return user;
    } catch (err) {
      throw new Error("Something went wrong!");
    }
  }
}

export const userService = new UserService();
