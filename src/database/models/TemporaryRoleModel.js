const mongoose = require('mongoose');

const TemporaryRoleSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  roleId: String,
  expiry: Date,
});

const TemporaryRole = mongoose.model('TemporaryRole', TemporaryRoleSchema);

module.exports = TemporaryRole;