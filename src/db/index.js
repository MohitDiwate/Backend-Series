import mongoose from "mongoose";
import { DB_NAME } from "./../constants.js";

const dbConnect = async()=>{
  try {
    const dbConnectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    console.log(`DB Connected Successfully !! DB HOST: ${dbConnectionInstance.connection.host}`);
  } catch (error) {
    console.log('ERROR: ',error);
    process.exit(1);
  }
}

export default dbConnect;