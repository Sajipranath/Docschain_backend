const mongoose = require('mongoose')
const uuid = require('uuid');
const generateUUID = uuid.v4;

const chatModel = new mongoose.Schema(
    {
        chatName: {type: String, trim: true},
        isGroupChat: {type: Boolean, default: false},
        users: [
            {
                type: String,
                ref: 'User',
                required: true,
            },
        ],
        latestMessage: {
            type: String,
            ref: 'Message',
            // required: true,
            default: null,
        },
        groupAdmin: {
            type: String,
            ref: 'User',
            required: false,
        },
    },
    {
        timestamps:true,
    }
);

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;