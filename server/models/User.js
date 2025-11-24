const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "#" + Math.floor(Math.random()*16777215).toString(16)
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);