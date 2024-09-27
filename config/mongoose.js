import mongoose from "mongoose";

const connectToMongoose = async()=>{
  try{
    // const URL = process.env.DB_PATH || "mongodb://127.0.0.1:27017/";
    await mongoose.connect("mongodb://127.0.0.1:27017/");
    console.log("Connected to mongoose db");
  }catch(err){
    console.log(err);
  }
};

export default connectToMongoose; 