import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import { Server } from "socket.io";
import http from "http";
import connectToMongoose from "./config/mongoose.js"
import chatModel from "./chat/chatSchema.js"

//
import path from "path";
import { fileURLToPath } from 'url';
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
//

const app = express();
let allCurrentConnectedUsers =[];
const allUsers = {};
//Optional
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"public", 'client.html'));
});
app.use(express.static(path.join(__dirname, 'public'))); 
// //Optional

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Connected to socket");

  //Enterd with name & roomcode
  socket.on("join",async (userData)=>{
    try{
      // console.log(socket); 
      console.log("inside join");
      socket.join(userData.roomcode);
      const PreviousChats =await chatModel.find({}).sort({time:1});
        // socket.broadcast.to(userData.roomcode).emit("perviousMessages",PreviousChats);
        io.to(userData.roomcode).emit("perviousMessages",PreviousChats);
      
      socket.broadcast.to(userData.roomcode).emit("other-join", userData.username);
      allUsers[socket.id] = userData.username;
      console.log(allUsers);
      allCurrentConnectedUsers.push(userData.username);
      io.to(userData.roomcode).emit("all-members",allUsers);
    }catch (error) {
        console.error("Error fetching previous chats:", error);
    } 
  })

  //sending messageto another client
  socket.on("send-message",async(data)=>{
    try{
      // console.log(data);
      //getting Time
      const now = new Date();
      const hours = now.getHours();   
      const minutes = now.getMinutes(); 
      const currentTime = `${hours}:${minutes}`;
      
      // console.log(`${hours}:${minutes}`);
      const newMessage = new chatModel({
         username:data.username,
          message:data.message,
          time:currentTime
      });
      await newMessage.save();
     // console.log("message sent from server",data.message);
      socket.broadcast.emit("server-message",{
        // io.to(data.roomcode).emit("server-message",{
        username:data.username,
        message:data.message,
          time:currentTime
      })
    }catch (error) {
      console.error("Error in sending message:", error);
    } 
  })
  //Typing Logic

socket.on("typing",(data)=>{
  io.emit("userTyping",data)
})
  
  //Disconnect Code
  socket.on("disconnect", () => {
    console.log("Socket disconnected",allUsers[socket.id]);
    // io.emit("disconnect-member",allUsers);
    socket.broadcast.emit("disconnect-member", allUsers[socket.id]);
    delete allUsers[socket.id];
    io.emit("all-members",allUsers);
    // io.to().emit("all-members")
  });
});

server.listen(3000,()=>{
  console.log("Server is running at 3000");
  connectToMongoose();
})


