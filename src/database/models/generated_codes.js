// Create a Mongoose model for the counter
const mongoose = require("mongoose");

const generatedCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },
  expiration: { type: Date, required: true },
  redeemed: [{ type: String }], // Store the user ID who redeemed the code
  disabled: { type: Boolean, default: false }, // New field to disable the code
});

const GeneratedCode = mongoose.model("GeneratedCode", generatedCodeSchema);

module.exports = GeneratedCode;
