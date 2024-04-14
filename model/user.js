const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
    _id: {
        type: String, // Set the ID field as a string type
        default: () => { 
            const uuid = require('uuid');
            return uuid.v4();
        }
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    batch:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    pic: {
      type: "String",
      required: false,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id},
    process.env.JWTPRIVATEKEY, {expiresIn:'7d'})
    return token;
};

const User = mongoose.model('User', userSchema);

const validate = (data) => {
    const Schema = Joi.object({
     //   _id: Joi.string().required().label('User ID'),
        firstName: Joi.string().required().label('First Name'),
        lastName: Joi.string().required().label('Last Name'),
        batch: Joi.string().required().label('Batch'),
        email: Joi.string().email().required().label('Email'),
        password: passwordComplexity().required().label('Password'),
       // pic: Joi.string().required().label('Profile Picture'),
       // isAdmin: Joi.boolean().required().label('Is Admin')
    });
    return Schema.validate(data)
};

module.exports = {User, validate};