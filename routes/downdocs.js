

const express = require('express');
const Download =require('../model/download')
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




  router.post('/hash',authMiddleware,async(req,res)=>{
 
     try{
        const hashValue =req.body.hashValue;

        console.log("Routed hash",hashValue);
        const userId = req.user._id;

       // Check if an entry with the same userId and hashValue exists
    const existingUpload = await Download.findOne({ userId, hashValue });



    if (existingUpload) {
        console.log("Duplicate upload. Entry already exists.");
        return res.status(400).json({ error: 'Duplicate upload. Entry already exists.' });
      }
        const uploadData =new Download({

            userId:userId,
            hashValue :hashValue,

        });

        await uploadData.save();
        res.status(201).json({ message: 'Download saved successfully' });
        console.log("Download hash added sucessfull to the database")
        

     }
     catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }


  });




// Define a route to fetch hash values
router.get('/hashvalues', authMiddleware, async (req, res) => {
  try {
    // Get the user's ID from the request (you can access it through req.user)
    const userId = req.user._id;

    // Query the database to get the hash values for the specific user
    const hashValues = await Download.find({ userId });

    res.json(hashValues); // Send the hash values as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


