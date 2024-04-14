const { string } = require('joi');
const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
 
  userId: {
    type: String,
    ref: 'User', // Reference the existing User model/collection
    required: true,
  },
  hashValue: {
    type: String,
    required: true,
  },
  
});

const Download= mongoose.model('download', downloadSchema);

module.exports = Download;
