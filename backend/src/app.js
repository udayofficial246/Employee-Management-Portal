import express from "express";
import prisma from "./utils/prisma.js";
import cors from 'cors';
import authRouter from './routes/auth.js';
import dashboardRouter from "./routes/dashboardRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipsRoutes.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth',authRouter)
app.use("/api/employees", employeesRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter)
app.use("/api/leave", leaveRouter)
app.use("/api/payslips", payslipRouter)
app.use("/api/dashboard", dashboardRouter)


app.listen(process.env.PORT, ()=>{
    console.log(`Server is runnning on port ${process.env.PORT}`);
})
