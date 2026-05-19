const mongoose = require("mongoose");
 
const UserSchema = new mongoose.Schema({
  Id:       Number,
  UserName: String,
  Userid:   String,
  code: String,
  Role:     { type: String, enum: ['admin', 'employee'], default: 'employee' },
}, {
  collection: "Users"
});
 
module.exports = mongoose.model('Users', UserSchema, 'offer')