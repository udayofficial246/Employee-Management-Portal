import validator from "validator";
import { z } from "zod";
import prisma from "../utils/prisma.js";


// ======================================================
// ZOD VALIDATION
// ======================================================

export const updateDepartmentSchema = z.object({

    name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters")
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),

    departmentHeadId: z
        .string()
        .uuid("Invalid department head id")
        .optional()
        .or(z.literal(""))
});


// ======================================================
// UPDATE DEPARTMENT
// ======================================================

export const updateDepartment = async (req, res) => {

    try {

        // ======================================================
        // GET DEPARTMENT ID
        // ======================================================

        const { departmentId } = req.params;

        // ======================================================
        // VALIDATE REQUEST
        // ======================================================

        const validatedData =
            updateDepartmentSchema.parse(req.body);

        // ======================================================
        // CHECK DEPARTMENT EXISTS
        // ======================================================

        const existingDepartment =
            await prisma.department.findUnique({
                where: {
                    id: departmentId
                }
            });

        if (!existingDepartment) {

            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // ======================================================
        // PREPARE UPDATE DATA
        // ======================================================

        const updateData = {};

        // ======================================================
        // NAME
        // ======================================================

        if (validatedData.name) {

            const sanitizedName = validator.escape(
                validatedData.name.trim()
            );

            // CHECK DUPLICATE NAME

            const duplicateDepartment =
                await prisma.department.findFirst({
                    where: {
                        name: sanitizedName,
                        NOT: {
                            id: departmentId
                        }
                    }
                });

            if (duplicateDepartment) {

                return res.status(409).json({
                    success: false,
                    message: "Department name already exists"
                });
            }

            updateData.name = sanitizedName;
        }

        // ======================================================
        // DESCRIPTION
        // ======================================================

        if (validatedData.description !== undefined) {

            updateData.description =
                validatedData.description
                    ? validator.escape(
                        validatedData.description.trim()
                    )
                    : null;
        }

        // ======================================================
        // DEPARTMENT HEAD
        // ======================================================

        if (validatedData.departmentHeadId !== undefined) {

            // REMOVE HEAD

            if (validatedData.departmentHeadId === "") {

                updateData.departmentHeadId = null;

            } else {

                // CHECK USER EXISTS

                const departmentHead =
                    await prisma.user.findUnique({
                        where: {
                            id: validatedData.departmentHeadId
                        }
                    });

                if (!departmentHead) {

                    return res.status(404).json({
                        success: false,
                        message: "Department head not found"
                    });
                }

                updateData.departmentHeadId =
                    validatedData.departmentHeadId;
            }
        }

        // ======================================================
        // UPDATE DEPARTMENT
        // ======================================================

        const updatedDepartment =
            await prisma.department.update({

                where: {
                    id: departmentId
                },

                data: updateData,

                include: {
                    departmentHead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department: updatedDepartment
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