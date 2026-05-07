import express from "express";
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