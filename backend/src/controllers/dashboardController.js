import prisma from "../lib/prisma.js";
import { DEPARTMENTS } from "../constants/departments.js";

// GET DASHBOARD
// GET /api/dashboard

export const getDashboard = async (req, res) => {
  try {
    const session = req.session;

    // ================= ADMIN =================
    if (session.role === "ADMIN") {

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(24, 0, 0, 0);

      const [totalEmployees, todayAttendance, pendingLeaves] =
        await Promise.all([

          prisma.user.count({
            where: {
              isDeleted: false,
            },
          }),

          prisma.attendance.count({
            where: {
              date: {
                gte: todayStart,
                lt: todayEnd,
              },
            },
          }),

          prisma.leave.count({
            where: {
              status: "PENDING",
            },
          }),
        ]);

      return res.json({
        role: "ADMIN",
        totalEmployees,
        totalDepartments: DEPARTMENTS.length,
        todayAttendance,
        pendingLeaves,
      });
    }

    // ================= EMPLOYEE =================

    else {

      const employee = await prisma.user.findUnique({
        where: {
          id: session.userId,
        },
      });

      if (!employee) {
        return res.status(404).json({
          error: "Employee not found",
        });
      }

      const today = new Date();

      const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      );

      const [
        currentMonthAttendance,
        pendingLeaves,
        latestPayslip,
      ] = await Promise.all([

        prisma.attendance.count({
          where: {
            userId: employee.id,
            date: {
              gte: firstDay,
              lt: lastDay,
            },
          },
        }),

        prisma.leave.count({
          where: {
            userId: employee.id,
            status: "PENDING",
          },
        }),

        prisma.payroll.findFirst({
          where: {
            userId: employee.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      return res.json({
        role: "EMPLOYEE",

        employee,

        currentMonthAttendance,

        pendingLeaves,

        latestPayslip: latestPayslip || null,
      });
    }

  } catch (error) {

    console.error("Dashboard error:", error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};