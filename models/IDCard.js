const mongoose = require("mongoose");

const idCardSchema = new mongoose.Schema({
    name: String,
    position: String,
    idNumber:Number,
    email: String,
    imageUrl: String  // Add this field to store the Cloudinary image URL
});

module.exports = mongoose.model("IDCard", idCardSchema);
