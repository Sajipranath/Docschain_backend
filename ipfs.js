const path = require('path');
const fs = require('fs');
const ipfsAPI = require('ipfs-api');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

const ipfs = ipfsAPI('127.0.0.1', '5001', { protocol: 'http' });

const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

// Middleware function for token verification
function verifyToken(req, res, next) {
  const token = req.header('x-auth-token');
  console.log('Token:', token); // Print the token in the console

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Continue with token verification logic or other operations...
  next();
} 

const upload = multer({ storage }).single('file');







// Apply the token verification middleware to relevant routes

router.post('/up', verifyToken,upload, (req, res) => {

  const file = req.file;
  if (!file) {
    console.error('No file provided');
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileBuffer = file.buffer; // Access the file buffer directly
    console.log("file buffer is called");
  ipfs.add(fileBuffer, (err, result) => {
    if (err) {
      console.error('IPFS upload error:', err);
      res.status(400).json({ error: 'IPFS upload error' });
    } else {
      const hash = result[0].hash;
      console.log('Document uploaded to IPFS with hash:', hash);
      fs.writeFile('uploadedHash.txt', hash, (err) => {
        if (err) throw err;
        console.log('Uploaded hash saved!');
      });
      //here the ipfs hash value return to frontend........
      res.json({ hash });
    }
  });
});
module.exports = router;
