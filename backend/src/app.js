import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from './routes/auth.js';
import dashboardRouter from "./routes/dashboardRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import payslipRouter from "./routes/payslipsRoutes.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();


// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());


// ======================================================
// ROUTES
// ======================================================
app.use('/api/auth',authRouter)
app.use("/api/employees", employeesRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter)
app.use("/api/leave", leaveRouter)
app.use("/api/payslips", payslipRouter)
app.use("/api/dashboard", dashboardRouter)

app.use("/api/auth", authRouter);

app.use("/api/admin", adminRouter);


// ======================================================
// SERVER
// ======================================================

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


