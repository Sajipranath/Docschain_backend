const express = require("express");

//const { protect } = require("../middleware/authMiddleware");

const Chat = require("../model/chatModel");
//const User = require('../model/user');
const {User}  = require('../model/user');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('../model/messageModel');
//const generateUUID = require('../path/to/your/generateUUID'); // Change the path to match your file structure


const router = express.Router();

// Middleware to authenticate the token
function authMiddleware(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded; // Set the decoded token as req.user
    console.log("Token:", token);
    console.log("Decoded:", decoded);

    next();
  }  catch (ex) {
     console.error(ex); // Log the error for debugging purposes
     return res.status(400).json({ message: 'Invalid token.', error: ex.message });
  }
}

//router.route("/").post(protect, accessChat);
//router.route("/").get(authMiddleware, fetchChats);
//router.route("/group").post(protect, createGroupChat);
//router.route("/rename").put(protect, renameGroup);
//router.route("/groupremove").put(protect, removeFromGroup);
//router.route("/groupadd").put(protect, addToGroup);


//Create or fetch One to One Chat POST /api/chat/
router.post('/', authMiddleware, async (req, res) => {
  const { userId } = req.body;
  //const userId = req.user._id;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "firstName pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      
      if (!createdChat.latestMessage) {
        // Create a default message
        const defaultMessage = new Message({
            // Set appropriate properties for your default message
            text: "Welcome to the chat!",
            sender: req.user._id,
            // ... other properties ...
        });
        
        // Save the default message and update the latestMessage field in the chat
        const savedDefaultMessage = await defaultMessage.save();
        createdChat.latestMessage = savedDefaultMessage._id;
        await createdChat.save();
    }

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//Fetch all chats for a user   GET /api/chat/
router.get('/', authMiddleware, async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "firstName pic email",
        });
        console.log('result', results)
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Create New Group Chat   POST /api/chat/group
router.post('/group', authMiddleware, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


//Rename Group PUT /api/chat/rename
router.put('/rename', authMiddleware,async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
       chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

//Remove user from Group  PUT /api/chat/groupremove
router.put('/groupremove', async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

//  Add user to Group   PUT /api/chat/groupadd
router.put('/groupadd', async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});


module.exports = router;