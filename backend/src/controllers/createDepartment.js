import validator from "validator"; 
import { z } from "zod";
import prisma from "../utils/prisma.js";


// ======================================================
// ZOD VALIDATION
// ======================================================


export const departmentSchema = z.object({

    name: z
        .string()
        .trim()
        .min(2, "Department name must be at least 2 characters")
        .max(100, "Department name cannot exceed 100 characters"),

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
})



// ======================================================
// CREATE Department
// ======================================================


export const createDepartment = async(req,res) =>{
    try{

    // ======================================================
    // VALIDATION
    // ======================================================
    
    const validatedData = departmentSchema.parse(req.body);

    // ======================================================
    // SANITIZATION
    // ======================================================

    const {name, description, departmentHeadId} = validatedData;

    const sanitizedName = validator.escape(
        name.trim()
    );

    const sanitizedDescription = description
        ? validator.escape(description.trim())
        : null;

        // ======================================================
        // CHECK DEPARTMENT ALREADY EXISTS
        // ======================================================

        const existingDepartment = await prisma.department.findUnique({
            where: {
                name: sanitizedName
            }
        });

        if(existingDepartment){
            return res.status(409).json({
                success: false,
                message: "Department already exists"
            });
        }

        // ======================================================
        // CHECK DEPARTMENT HEAD EXISTS
        // ======================================================

            if (departmentHeadId) {

            const departmentHead = await prisma.user.findUnique({
                where: {
                    id: departmentHeadId
                }
            });

            if (!departmentHead) {

                return res.status(404).json({
                    success: false,
                    message: "Department head not found"
                });
            }
        }

        // ======================================================
        // CREATE DEPARTMENT
        // ======================================================

        const department = await prisma.department.create({
            data: {
                name: sanitizedName,
                description: sanitizedDescription,
                departmentHeadId: departmentHeadId || null
            },

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
        
        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });


    } catch(error){

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
}