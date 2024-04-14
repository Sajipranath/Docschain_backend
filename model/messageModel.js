const mongoose = require('mongoose')

const messageModel = new mongoose.Schema(
    {
        sender: {type: String, ref:"User"},
        content: {type:String, trim:true},
        chat:{type: String, ref:"Chat"},
    },
    {
        timestamps:true,
    }
);

const Message = mongoose.model("Message",messageModel);
module.exports = Message;