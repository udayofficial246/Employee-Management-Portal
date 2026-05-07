import express from "express";
import prisma from "./utils/prisma.js";
import cors from 'cors';
import authRouter from './routes/auth.js';

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth',authRouter)


app.listen(process.env.PORT, ()=>{
    console.log(`Server is runnning on port ${process.env.PORT}`);
})