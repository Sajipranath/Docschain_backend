const express = require('express');
const {Router} = require("express");


const {User} = require('../model/user');
const Chat = require("../model/chatModel");
const Message = require('../model/messageModel');
//const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
//const router = express.Router();

module.exports = (io) => {
    const router = express.Router();
    //Middleware to authenticate the token
    function authMiddleware(req, res, next) {
        const token = req.header('x-auth-token');
        if (!token) {
          return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
      
        try {
          const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
          console.log(token)
          req.user = decoded; // Set the decoded token as req.user
          // console.log(req.user);
          next();
        } catch (ex) {
          return res.status(400).json({ message: 'Invalid token.' });
        }
      }


    //router.route("/:chatId").get(protect, allMessages);
    //router.route("/").post(protect, sendMessage);

    //Get all Messages   GET /api/Message/:chatId
    router.get('/:chatId', authMiddleware, async (req, res) => {
      try {
        const messages = await Message.find({ chat: req.params.chatId })
          .populate("sender", "firstName pic email")
          .populate("chat");
        res.json(messages);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    });

    //Create New Message   POST /api/Message/
    router.post('/',authMiddleware, async (req, res) => {
      const { content, chatId } = req.body;

      if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
      }

      var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
      };

      try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "firstName pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
          path: "chat.users",
          select: "firstName pic email",
        });

        // Find the receiver's ID from the chat
        const chat = await Chat.findById(chatId);
        const receiverId = chat.users.find(user => user != req.user._id);

        // Get the receiver's socket ID from the connected sockets
        const receiverSocket = io.sockets.sockets[receiverId];
        if (!receiverSocket) {
          // If the receiver is not currently connected, store the message as an unread notification
          const unreadNotification = {
            message: message._id,
            createdAt: new Date(),
          };
          await User.findByIdAndUpdate(receiverId, { $push: { notifications: unreadNotification } });
        } else {
          // If the receiver is connected, emit the new message event
          receiverSocket.emit("message received", message);
        }

        //await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    });
return router;
};
//module.exports = router;