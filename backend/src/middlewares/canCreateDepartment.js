import prisma from "../utils/prisma.js";

const canCreateDepartment = async (req, res, next) => {

    try {

        const creator = req.user;

        // ==================================================
        // CHECK CREATE EMPLOYEE PERMISSION
        // ==================================================

        const permission = await prisma.rolePermission.findFirst({
            where: {
                roleId: creator.roleId,
                permission: {
                    module: "DEPARTMENT",
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
                message: "You don't have permission to create department"
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

export default canCreateDepartment;