const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// playerName, mail, password

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Player name must be included."],
    trim: true,
  },
  mail: {
    type: String,
    required: [true, "Email ID must be included."],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is needed!"],
    minlength: [8, "Password must be at least 8 characters."],
    maxlength: [32, "Password must be at most 32 characters."],
    select: false,
  },
});

playerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  console.log("password is bcrypted");
  next();
});

playerSchema.methods.correctPlayerPassword = async function (
  thePassword,
  playerPassword
) {
  return await bcrypt.compare(thePassword, playerPassword);
};

module.exports = mongoose.model("Player", playerSchema);
