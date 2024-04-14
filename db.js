require('dotenv').config();
const mongoose = require('mongoose');

const Connection = async () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    try {
        await mongoose.connect(process.env.DB, connectionParams);
        console.log("Connected to Database Successfully");
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error; // Rethrow the error to handle it in the calling code
    }
};

module.exports = Connection;
