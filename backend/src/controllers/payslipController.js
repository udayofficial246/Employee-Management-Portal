import prisma from "../lib/prisma.js";


// ================= CREATE PAYSLIP =================
// POST /api/payslips

export const createPayslip = async (req, res) => {

  try {

    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
    } = req.body;

    if (
      !employeeId ||
      !month ||
      !year ||
      !basicSalary
    ) {

      return res.status(400).json({
        error: "Missing fields",
      });
    }

    // Calculate net salary
    const netSalary =
      Number(basicSalary) +
      Number(allowances || 0) -
      Number(deductions || 0);

    // Create payroll/payslip
    const payslip = await prisma.payroll.create({

      data: {

        userId: employeeId,

        month: Number(month),

        year: Number(year),

        basicSalary: Number(basicSalary),

        allowances: Number(allowances || 0),

        deductions: Number(deductions || 0),

        netSalary,
      },
    });

    return res.json({
      success: true,
      data: payslip,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};


// ================= GET PAYSLIPS =================
// GET /api/payslips

export const getPayslips = async (req, res) => {

  try {

    const session = req.session;

    const isAdmin = session.role === "ADMIN";

    // ================= ADMIN =================

    if (isAdmin) {

      const payslips = await prisma.payroll.findMany({

        include: {
          user: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      const data = payslips.map((payslip) => ({

        ...payslip,

        employee: payslip.user,

        employeeId: payslip.user?.id,
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

      const payslips = await prisma.payroll.findMany({

        where: {
          userId: employee.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        data: payslips,
      });
    }

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};


// ================= GET PAYSLIP BY ID =================
// GET /api/payslips/:id

export const getPayslipById = async (req, res) => {

  try {

    const payslip = await prisma.payroll.findUnique({

      where: {
        id: req.params.id,
      },

      include: {
        user: true,
      },
    });

    if (!payslip) {

      return res.status(404).json({
        error: "Not found",
      });
    }

    const result = {

      ...payslip,

      employee: payslip.user,
    };

    return res.json(result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed",
    });
  }
};