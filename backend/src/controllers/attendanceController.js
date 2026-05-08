import { inngest } from "../inngest/index.js";
import prisma from "../lib/prisma.js";

// Clock in/out for employee
// POST /api/attendance

export const clockInOut = async (req, res) => {
  try {

    const session = req.session;

    // Find employee/user
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

    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot clock in/out.",
      });
    }

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check existing attendance
    const existing = await prisma.attendance.findFirst({
      where: {
        userId: employee.id,
        date: today,
      },
    });

    const now = new Date();

    // ================= CHECK IN =================

    if (!existing) {

      const isLate =
        now.getHours() > 9 ||
        (now.getHours() === 9 && now.getMinutes() > 0);

      const attendance = await prisma.attendance.create({
        data: {
          userId: employee.id,
          date: today,
          checkIn: now,
          status: isLate ? "LATE" : "PRESENT",
        },
      });

      await inngest.send({
        name: "employee/check-out",
        data: {
          employeeId: employee.id,
          attendanceId: attendance.id,
        },
      });

      return res.json({
        success: true,
        type: "CHECK_IN",
        data: attendance,
      });
    }

    // ================= CHECK OUT =================

    else if (!existing.checkOut) {

      const checkInTime = new Date(existing.checkIn).getTime();

      const diffMs = now.getTime() - checkInTime;

      const diffHours = diffMs / (1000 * 60 * 60);

      const workingHours = parseFloat(diffHours.toFixed(2));

      let dayType = "HALF_DAY";

      if (workingHours >= 8) {
        dayType = "FULL_DAY";
      }

      else if (workingHours >= 6) {
        dayType = "THREE_QUARTER_DAY";
      }

      else if (workingHours >= 4) {
        dayType = "HALF_DAY";
      }

      else {
        dayType = "SHORT_DAY";
      }

      const updatedAttendance = await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          checkOut: now,
          workingHours,
          dayType,
        },
      });

      return res.json({
        success: true,
        type: "CHECK_OUT",
        data: updatedAttendance,
      });
    }

    // ================= ALREADY CHECKED OUT =================

    else {

      return res.json({
        success: true,
        type: "CHECK_OUT",
        data: existing,
      });
    }

  } catch (error) {

    console.error("Attendance Error:", error);

    return res.status(500).json({
      error: "Operation failed",
    });
  }
};


// Get attendance for employee
// GET /api/attendance

export const getAttendance = async (req, res) => {

  try {

    const session = req.session;

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

    const limit = parseInt(req.query.limit || 30);

    const history = await prisma.attendance.findMany({
      where: {
        userId: employee.id,
      },

      orderBy: {
        date: "desc",
      },

      take: limit,
    });

    return res.json({
      data: history,

      employee: {
        isDeleted: employee.isDeleted,
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch attendance",
    });
  }
};