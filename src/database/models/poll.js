const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  pollId: String,
  channelId: String,
  pollObject: String,
  votersIds: [String],
  duration: Number,
});

const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;
