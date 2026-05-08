import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const hasToken = async (req, res, next) => {

    try {

        // ======================================================
        // GET TOKEN FROM COOKIES
        // ======================================================

        const token = req.cookies?.token;

        // ======================================================
        // CHECK TOKEN EXISTS
        // ======================================================

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided"
            });
        }

        // ======================================================
        // VERIFY TOKEN
        // ======================================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ======================================================
        // CHECK USER EXISTS
        // ======================================================

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            include: {
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // ======================================================
        // CHECK ACCOUNT STATUS
        // ======================================================

        if (user.isDeleted) {
            return res.status(403).json({
                success: false,
                message: "Account deleted"
            });
        }

        if (user.isLocked) {
            return res.status(403).json({
                success: false,
                message: "Account locked"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account inactive"
            });
        }

        // ======================================================
        // ATTACH USER TO REQUEST
        // ======================================================

        req.user = user;

        // ======================================================
        // NEXT MIDDLEWARE
        // ======================================================

        next();

    } catch (error) {

        // ======================================================
        // JWT ERRORS
        // ======================================================

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export default hasToken;