// newsLetterSchema.js

import mongoose from "mongoose";

const newsLetterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribed: {
    type: Boolean,
    default: true,
  },
});

// Create the model
const Newsletter = mongoose.model("Newsletter", newsLetterSchema);

export default Newsletter; // Use export default for ESM
