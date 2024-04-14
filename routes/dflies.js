const express = require('express');
const router = require("express").Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ipfsAPI = require('ipfs-api');
const multer = require('multer');

const Upload = require('../model/upload');





const ipfs = ipfsAPI('127.0.0.1', '5001', { protocol: 'http' });

const storage = multer.memoryStorage(); 

// Middleware function for token verification
function verifyToken(req, res, next) {
    const token = req.header('x-auth-token');
   //  console.log('Token:', token); // Print the token in the console
  
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
     // console.log("Decoded value->",decoded);
  
      req.user = decoded; // Set the decoded token as req.user
    //  console.log ('decoded user:::',req.user);
  
      next();
  
    } catch (ex) {
      return res.status(400).json({ message: 'Invalid token.' });
    }


  } 




  router.get('/down/:hash', verifyToken, async (req, res) => {
    try {
      const hashValue = req.params.hash;
      console.log('Received hash:', hashValue);
  
      // Find the file with the specified hash in the database
      const file = await Upload.findOne({ hashValue});
      if (!file) {
        console.log('File not found');
        return res.status(404).json({ message: 'File not found' });
      }
  
      const fileName = file.fileName; // Extract the file name from the retrieved file object
  
      console.log('File Name:', fileName);
  
      // Construct the file path within the download folder using the original file name
      const filePath = path.join(__dirname, 'Documents', fileName);
  
      // Download the file from IPFS and save it to the specified file path
      ipfs.get(hashValue, (err, files) => {
        if (err) {
          console.error('IPFS download error:', err);
          return res.status(500).json({ message: 'Error downloading file' });
        }
  
        const fileData = files[0].content;
  
        fs.writeFile(filePath, fileData, (err) => {
          if (err) {
            console.error('Error writing downloaded file:', err);
            return res.status(500).json({ message: 'Error saving downloaded file' });
          }
  
          console.log('PDF document downloaded and saved:', filePath);
  
          // Generate the download URL link for the file using the IPFS gateway
          const fileURL = `http://localhost:8080/ipfs/${hashValue}`;

          console.log(fileURL);
          // Send the response to the frontend with the file name and download URL link
          res.json({ fileName, downloadLink: fileURL });
        });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  



  module.exports = router;