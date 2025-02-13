const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  companyName: { type: String },
  // password: { type: String, required: true },
  uid: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String },
});

module.exports = mongoose.model.User || mongoose.model("User", userSchema);

// username:username,
// email:email,
// mobileNo:mobileNo,
// companyName:companyName,
// password: password, 
// uid: userRecord.uid,