import dotenv from 'dotenv';
import dbConnect from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
  path:'./env'
})

const PORT = process.env.PORT || 8000;

dbConnect()
.then(()=>{
  app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
  })
})
.catch((err)=>{
  console.log('MongoDB Connection Failed!!',err);
})




















/*
import express from "express";
const app = express();
(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    app.on("error",(error)=>{
      console.log("ERROR: ",error);
      throw error;
    })

    app.listen(process.env.PORT,()=>{
      console.log(`Server is running on port ${process.env.PORT}`);
    })
  } catch (error) {
    console.error('ERROR: ',error);
    throw error;
  }
})()
*/