require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const ipfsRoutes = require('./ipfs');
const uploadRoutes =require ('./routes/ufiles');
const downloadRoutes =require('./routes/dflies');
const hashRoutes =require('./routes/downdocs');
const chatRoutes = require('./routes/chatRoutes');
//const messageRoutes = require('./routes/messageRoutes')(io); // Pass the 'io' object here
const { notFound, errorHandler } = require("./middleware/errorMiddleware");



//middlewares
app.use(express.json());
app.use(cors());


//database Connection
async function startServer() {
    try {
        await connection();


            
        

 
            const port = process.env.PORT || 4000;
            const server = app.listen(port, () => console.log(`Listening on port ${port} ...`));

            const io = require("socket.io")(server, {
            pingTimeout: 60000,
            cors: {
                origin: "http://localhost:3000",
                // credentials: true,
            },
            });

            const messageRoutes = require('./routes/messageRoutes')(io); // Pass the 'io' object here

            //routes
            app.use('/api/users', userRoutes);
            
            app.use('/api/auth', authRoutes);

           

            //chatroutes
            app.use("/api/chat", chatRoutes);
            app.use("/api/message", messageRoutes);

            // Mount the IPFS routes
            app.use('/api/ipfs', ipfsRoutes);

            // upload the flies to ipfs
            app.use ('/api/ufiles',uploadRoutes);

            // download the files from ipfs
            app.use('/api/dflies',downloadRoutes);

            //save the hash to db
            app.use('/api/downdocs',hashRoutes);

           // app.use('/api/downdocs',hashRoutes);

            // Error Handling middlewares
            app.use(notFound);
            app.use(errorHandler);

            // io.on("connection", (socket) => {
            // console.log("Connected to socket.io");
            // socket.on("setup", (userData) => {
            //     socket.join(userData._id);
            //     socket.emit("connected");
            // });

            // socket.on("join chat", (room) => {
            //     socket.join(room);
            //     console.log("User Joined Room: " + room);
            // });
            // socket.on("typing", (room) => socket.in(room).emit("typing"));
            // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

            // socket.on("new message", (newMessageRecieved) => {
            //     var chat = newMessageRecieved.chat;

            //     if (!chat.users) return console.log("chat.users not defined");

            //     chat.users.forEach((user) => {
            //     if (user._id == newMessageRecieved.sender._id) return;

            //     socket.in(user._id).emit("message recieved", newMessageRecieved);
            //     });
            // });

            //  socket.on("disconnect", () => {
            //     console.log("USER DISCONNECTED");
            //      socket.leave(userData._id);
            //  }
            
            
            //  );

            //});
        } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1); // Exit the process with an error code
    }
}

// Call the async function to start the server
startServer();