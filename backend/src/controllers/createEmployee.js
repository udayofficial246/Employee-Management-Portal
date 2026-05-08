import bcrypt from "bcrypt";
import validator from "validator";
import { z } from "zod";
import prisma from "../utils/prisma.js";


// ======================================================
// ZOD VALIDATION
// ======================================================

export const employeeSchema = z.object({

    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters"),

    lastName: z
        .string()
        .trim()
        .min(0, "Last name must be at least 2 characters")
        .max(50, "Last name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            "Password must contain uppercase, lowercase and number"
        ),

    phone: z
        .string()
        .trim()
        .regex(
            /^[0-9]{10}$/,
            "Phone number must be 10 digits"
        ),

    designation: z
        .string()
        .trim()
        .min(2, "Designation is required")
        .max(100, "Designation too long"),

    profileImage: z
        .string()
        .trim()
        .url("Profile image must be valid")
        .optional()
        .or(z.literal("")),

    joiningDate: z.coerce.date(),

    salary: z.coerce
        .number()
        .positive("Salary must be positive"),

    roleId: z
        .string()
        .uuid("Invalid role id"),

    departmentId: z
        .string()
        .uuid("Invalid department id")
        .optional(),

    reportsToId: z
        .string()
        .uuid("Invalid reporting manager id")
        .optional(),

    location: z
        .string()
        .trim()
        .min(2, "Location is required")
        .max(100, "Location too long")
        .optional()
});


// ======================================================
// CREATE EMPLOYEE
// ======================================================

export const createEmployee = async (req, res) => {

    try {

        // ======================================================
        // VALIDATION
        // ======================================================

        const validatedData = employeeSchema.parse(req.body);

        // ======================================================
        // SANITIZATION
        // ======================================================

        const sanitizedFirstName = validator.escape(
            validatedData.firstName.trim()
        );

        const sanitizedLastName = validator.escape(
            validatedData.lastName.trim()
        );

        const sanitizedEmail = validator.normalizeEmail(
            validatedData.email.trim().toLowerCase()
        );

        // ======================================================
        // CHECK EXISTING EMAIL
        // ======================================================

        const existingEmployee = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail
            }
        });

        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // ======================================================
        // CHECK EXISTING PHONE
        // ======================================================

        const existingPhone = await prisma.user.findUnique({
            where: {
                phone: validatedData.phone
            }
        });

        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: "Phone number already exists"
            });
        }

        // ======================================================
        // CHECK ROLE EXISTS
        // ======================================================

        const roleExists = await prisma.role.findUnique({
            where: {
                id: validatedData.roleId
            }
        });

        if (!roleExists) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // ======================================================
        // CHECK DEPARTMENT EXISTS
        // ======================================================

        if (validatedData.departmentId) {

            const departmentExists = await prisma.department.findUnique({
                where: {
                    id: validatedData.departmentId
                }
            });

            if (!departmentExists) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department"
                });
            }
        }

        // ======================================================
        // CHECK REPORTING MANAGER EXISTS
        // ======================================================

        if (validatedData.reportsToId) {

            const managerExists = await prisma.user.findUnique({
                where: {
                    id: validatedData.reportsToId
                }
            });

            if (!managerExists) {
                return res.status(400).json({
                    success: false,
                    message: "Reporting manager not found"
                });
            }
        }

        // ======================================================
        // HASH PASSWORD
        // ======================================================

        const hashedPassword = await bcrypt.hash(
            validatedData.password,
            10
        );

        // ======================================================
        // GENERATE EMPLOYEE CODE
        // ======================================================

        const employeeCode = `EMP-${Date.now()}`;

        // ======================================================
        // CREATE EMPLOYEE
        // ======================================================

        const employee = await prisma.user.create({
            data: {

                employeeCode,

                firstName: sanitizedFirstName,

                lastName: sanitizedLastName,

                email: sanitizedEmail,

                password: hashedPassword,

                phone: validatedData.phone,

                designation: validatedData.designation,

                profileImage: validatedData.profileImage,

                joiningDate: validatedData.joiningDate,

                salary: validatedData.salary,

                location: validatedData.location,

                roleId: validatedData.roleId,

                departmentId: validatedData.departmentId,

                reportsToId: validatedData.reportsToId,

                createdById: req.user?.id || null
            }
        });

        // ======================================================
        // REMOVE PASSWORD FROM RESPONSE
        // ======================================================

        const { password, ...safeEmployee } = employee;

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee: safeEmployee
        });

    } catch (error) {

        // ======================================================
        // ZOD VALIDATION ERROR
        // ======================================================

        if (error instanceof z.ZodError) {

            return res.status(400).json({
                success: false,
                errors: error.errors
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};