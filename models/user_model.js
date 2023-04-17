const { stringify } = require("circular-json");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:true,
  },
  is_admin:{
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model("User", userSchema);
