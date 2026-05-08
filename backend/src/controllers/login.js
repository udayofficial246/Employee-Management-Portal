import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // ======================================================
        // VALIDATION
        // ======================================================

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // ======================================================
        // FIND USER
        // ======================================================

        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                role: true
            }
        });

        // ======================================================
        // USER NOT FOUND
        // ======================================================

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // ======================================================
        // CHECK PASSWORD
        // ======================================================

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {

            // Optional: increment failed attempts

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: {
                        increment: 1
                    }
                }
            });

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // ======================================================
        // RESET FAILED LOGIN ATTEMPTS
        // ======================================================

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date()
            }
        });

        // ======================================================
        // GENERATE JWT TOKEN
        // ======================================================

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role.name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // ======================================================
        // SET COOKIE
        // ======================================================

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // ======================================================
        // RESPONSE
        // ======================================================

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { login };