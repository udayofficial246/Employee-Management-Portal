import prisma from "../lib/prisma.js";


// ================= GET PROFILE =================
// GET /api/profile

export const getProfile = async (req, res) => {

  try {

    const session = req.session;

    const employee = await prisma.user.findUnique({

      where: {
        id: session.userId,
      },

      include: {
        role: true,
        department: true,
      },
    });

    // If no employee/user found
    if (!employee) {

      return res.json({
        firstName: "Admin",
        lastName: "",
        email: session.email,
      });
    }

    return res.json(employee);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
};


// ================= UPDATE PROFILE =================
// PUT /api/profile

export const updateProfile = async (req, res) => {

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

    // Check if deleted/deactivated
    if (employee.isDeleted) {

      return res.status(403).json({
        error:
          "Your account is deactivated. You cannot update your profile.",
      });
    }

    // Update bio
    await prisma.user.update({

      where: {
        id: employee.id,
      },

      data: {
        bio: req.body.bio,
      },
    });

    return res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to update profile",
    });
  }
};