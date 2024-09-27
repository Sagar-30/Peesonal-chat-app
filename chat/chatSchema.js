import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  username:String,
  message:String,
  time:String,
  createdAt:{
    type:Date,
    default:new Date().toString()
  }
});

const chatModel = mongoose.model("chat",chatSchema);

export default chatModel;