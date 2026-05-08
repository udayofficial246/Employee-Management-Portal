import express from "express";
<<<<<<< HEAD
import prisma from "./prisma.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


startServer();
=======
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
>>>>>>> 2b0a80dc0eebea6279437954dc0b6c70b8a898e5
