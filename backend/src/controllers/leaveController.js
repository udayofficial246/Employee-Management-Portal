import { inngest } from "../inngest/index.js";
import prisma from "../lib/prisma.js";


// ================= CREATE LEAVE =================
// POST /api/leaves

export const createLeave = async (req, res) => {

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

    if (employee.isDeleted) {

      return res.status(403).json({
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const {
      type,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (!type || !startDate || !endDate || !reason) {

      return res.status(400).json({
        error: "Missing fields",
      });
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      new Date(startDate) <= today ||
      new Date(endDate) <= today
    ) {

      return res.status(400).json({
        error: "Leave dates must be in the future",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {

      return res.status(400).json({
        error: "End date cannot be before start date",
      });
    }

    // Create leave
    const leave = await prisma.leave.create({

      data: {
        userId: employee.id,

        type,

        startDate: new Date(startDate),

        endDate: new Date(endDate),

        reason,

        status: "PENDING",
      },
    });

    // Trigger inngest event
    await inngest.send({
      name: "leave/pending",

      data: {
        leaveApplicationId: leave.id,
      },
    });

    return res.json({
      success: true,
      data: leave,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};


// ================= GET LEAVES =================
// GET /api/leaves

export const getLeaves = async (req, res) => {

  try {

    const session = req.session;

    const isAdmin = session.role === "ADMIN";

    // ================= ADMIN =================

    if (isAdmin) {

      const status = req.query.status;

      const where = status
        ? { status }
        : {};

      const leaves = await prisma.leave.findMany({

        where,

        include: {
          user: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      const data = leaves.map((leave) => ({

        ...leave,

        employee: leave.user,

        employeeId: leave.user?.id,
      }));

      return res.json({
        data,
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
          error: "Not found",
        });
      }

      const leaves = await prisma.leave.findMany({

        where: {
          userId: employee.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        data: leaves,

        employee,
      });
    }

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};


// ================= UPDATE LEAVE STATUS =================
// PATCH /api/leaves/:id

export const updateLeaveStatus = async (req, res) => {

  try {

    const { status } = req.body;

    if (
      !["APPROVED", "REJECTED", "PENDING"].includes(status)
    ) {

      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const leave = await prisma.leave.update({

      where: {
        id: req.params.id,
      },

      data: {
        status,
      },
    });

    return res.json({
      success: true,
      data: leave,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};