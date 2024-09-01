import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const mongodb_URL=process.env.MONGODB_URL

export const connectDB=async(req,res)=>{
    try {
        const connection=await mongoose.connect(mongodb_URL)
        console.log("MongoDb connected Successfully")
        return connection
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"MongoDB Connection Failure"})
    }
}