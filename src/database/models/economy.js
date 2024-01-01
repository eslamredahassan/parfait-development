// Create a Mongoose model for the counter
const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema({
  guildID: String,
  userName: String,
  userId: String,
  roleId: String,
  iceCoins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
});

const Currency = mongoose.model("Currency", CurrencySchema);

module.exports = Currency;
