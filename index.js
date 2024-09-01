import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './Database/Config.js';
import userRouter from './Routes/userRouter.js';
import { app, server } from './Socket/index.js';



//initalization
//const app=express()

dotenv.config()
//middlewares
app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use(cookieParser())


//connecting DB
connectDB()

//routers
app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
   return res.status(200).send('welcome to my app')
})

server.listen(process.env.PORT,()=>{
    console.log('Server is listenning to the port')
})