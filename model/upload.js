const { string } = require('joi');
const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
 
  userId: {
    type: String,
    ref: 'User', // Reference the existing User model/collection
    required: true,
  },
  hashValue: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
});

const Upload = mongoose.model('upload', uploadSchema);

module.exports = Upload;
