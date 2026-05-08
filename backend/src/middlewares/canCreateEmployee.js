import prisma from "../utils/prisma.js";

const canCreateEmployee = async (req, res, next) => {

    try {

        const creator = req.user;

        // ==================================================
        // CHECK CREATE EMPLOYEE PERMISSION
        // ==================================================

        const permission = await prisma.rolePermission.findFirst({
            where: {
                roleId: creator.roleId,
                permission: {
                    module: "EMPLOYEE",
                    action: "CREATE"
                }
            },
            include: {
                permission: true
            }
        });

        if (!permission) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to create employees"
            });
        }

        // ==================================================
        // TARGET ROLE
        // ==================================================

        const targetRole = await prisma.role.findUnique({
            where: {
                id: req.body.roleId
            }
        });

        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: "Invalid target role"
            });
        }

        // ==================================================
        // HIERARCHY CHECK
        // ==================================================

        if (creator.role.level <= targetRole.level) {

            return res.status(403).json({
                success: false,
                message:
                    "You cannot create employee with same or higher role"
            });
        }

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Authorization failed"
        });
    }
};

export default canCreateEmployee;