const express = require('express');
const Upload  =require('../model/upload');
const router = require("express").Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');


function authMiddleware(req,res,next){
  const token = req.header('x-auth-token');
  // console.log('Token for User id:', token); // Print the token in the console
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

};




router.post('/updb', authMiddleware,async(req,res) =>{
    try {
        const {  hashValue, fileName} = req.body;
        const userId = req.user._id;
       
      //   console.log(req.body);

      //   console.log('Hash value:', hashValue);
      //  console.log('File name:', fileName);
      //    console.log('User ID:', userId);
         // Assuming you have the authenticated user available in req.user
  
    if (!hashValue || !fileName || !userId) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const existingUpload = await Upload.findOne({ hashValue: hashValue });
    if (existingUpload) {

      console.log("Duplicate hash value. Upload already exists.");
      return res.status(400).json({ error: 'Duplicate hash value. Upload already exists.' });
      
    }
       // const uploadData = new Upload(req.body)
        
        const uploadData = new Upload({
          userId: userId, // Access the user ID from req.user
          hashValue: hashValue,
          fileName: fileName,
        });

        await uploadData.save();
        res.status(201).json({ message: 'Upload saved successfully' });
        console.log("Data added sucessfull to the database")
      } 
      
      catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
} );



// GET route to retrieve file data for a specific user
router.get('/files', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const files = await Upload.find({ userId }); // Retrieve only fileName and hashValue

    res.status(200).json(files);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET route to retrieve file data for a specific user
router.get('/filename', authMiddleware, async (req, res) => {
  try {
      
    const hashval =req.hashValue;
    const userId = req.user._id;
    console.log("Routed key",hashval)
    const filename = await Upload.find({ hashval}); // Retrieve only fileName and hashValue

    res.status(200).json(filename);
  
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
