const mongoose = require("mongoose");

const roleMarketSchema = new mongoose.Schema({
  userId: String,
  username: String,
  serverId: String,
  roleId: String,
  roleExpiresAt: Date, // Ensure this line is correctly defined as Date
});

const RoleMarket = mongoose.model("RoleMarket", roleMarketSchema);
module.exports = RoleMarket;
