import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";


// ================= GET EMPLOYEES =================
// GET /api/employees

export const getEmployees = async (req, res) => {

  try {

    const { department } = req.query;

    const where = {};

    if (department) {
      where.department = {
        name: department,
      };
    }

    const employees = await prisma.user.findMany({

      where: {
        ...where,
        role: {
          name: {
            not: "ADMIN",
          },
        },
      },

      include: {
        role: true,
        department: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const result = employees.map((emp) => ({
      ...emp,

      user: {
        email: emp.email,
        role: emp.role?.name,
      },
    }));

    return res.json(result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch employees",
    });
  }
};


// ================= CREATE EMPLOYEE =================
// POST /api/employees

export const createEmployee = async (req, res) => {

  try {

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      departmentId,
      basicSalary,
      allowances,
      deductions,
      joinDate,
      password,
      roleId,
      bio,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {

      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {

      return res.status(400).json({
        error: "Email already exists",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const employee = await prisma.user.create({

      data: {
        firstName,
        lastName,
        email,
        password: hashed,

        phone,
        position,

        basicSalary: Number(basicSalary) || 0,
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,

        joinDate: joinDate ? new Date(joinDate) : null,

        bio: bio || "",

        employmentStatus: "ACTIVE",

        roleId,

        departmentId,
      },

      include: {
        role: true,
        department: true,
      },
    });

    return res.status(201).json({
      success: true,
      employee,
    });

  } catch (error) {

    console.error("Create employee error:", error);

    return res.status(500).json({
      error: "Failed to create employee",
    });
  }
};


// ================= UPDATE EMPLOYEE =================
// PUT /api/employees/:id

export const updateEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      departmentId,
      basicSalary,
      allowances,
      deductions,
      password,
      roleId,
      bio,
      employmentStatus,
    } = req.body;

    const employee = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {

      return res.status(404).json({
        error: "Employee not found",
      });
    }

    // Build update object
    const updateData = {

      firstName,
      lastName,
      email,

      phone,
      position,

      departmentId,

      basicSalary: Number(basicSalary) || 0,

      allowances: Number(allowances) || 0,

      deductions: Number(deductions) || 0,

      employmentStatus: employmentStatus || "ACTIVE",

      bio: bio || "",

      roleId,
    };

    // Hash password if provided
    if (password) {

      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({

      where: {
        id,
      },

      data: updateData,
    });

    return res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to update employee",
    });
  }
};


// ================= DELETE EMPLOYEE =================
// DELETE /api/employees/:id

export const deleteEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    const employee = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {

      return res.status(404).json({
        error: "Employee not found",
      });
    }

    await prisma.user.update({

      where: {
        id,
      },

      data: {
        isDeleted: true,
        employmentStatus: "INACTIVE",
      },
    });

    return res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to delete employee",
    });
  }
};