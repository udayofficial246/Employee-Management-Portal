import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

    // ======================================================
    // CREATE ROLES
    // ======================================================

    const adminRole = await prisma.role.upsert({
        where: {
            name: "Admin"
        },
        update: {},
        create: {
            name: "Admin",
            description: "System Administrator",
            isSystemRole: true
        }
    });

    const hrRole = await prisma.role.upsert({
        where: {
            name: "HR"
        },
        update: {},
        create: {
            name: "HR",
            description: "Human Resource",
            isSystemRole: true
        }
    });

    const managerRole = await prisma.role.upsert({
        where: {
            name: "Manager"
        },
        update: {},
        create: {
            name: "Manager",
            description: "Team Manager",
            isSystemRole: true
        }
    });

    const employeeRole = await prisma.role.upsert({
        where: {
            name: "Employee"
        },
        update: {},
        create: {
            name: "Employee",
            description: "Regular Employee",
            isSystemRole: true
        }
    });

    // ======================================================
    // CREATE DEPARTMENTS
    // ======================================================

    const techDepartment = await prisma.department.upsert({
        where: {
            name: "Technology"
        },
        update: {},
        create: {
            name: "Technology",
            description: "Handles software and technical operations"
        }
    });

    const hrDepartment = await prisma.department.upsert({
        where: {
            name: "Human Resource"
        },
        update: {},
        create: {
            name: "Human Resource",
            description: "Handles employee management"
        }
    });

    const financeDepartment = await prisma.department.upsert({
        where: {
            name: "Finance"
        },
        update: {},
        create: {
            name: "Finance",
            description: "Handles payroll and finance"
        }
    });

    // ======================================================
    // LOG OUTPUT
    // ======================================================

    console.log("\n================ SEEDED DATA ================\n");

    console.log("ROLES:\n");

    console.log("Admin Role ID:", adminRole.id);
    console.log("HR Role ID:", hrRole.id);
    console.log("Manager Role ID:", managerRole.id);
    console.log("Employee Role ID:", employeeRole.id);

    console.log("\nDEPARTMENTS:\n");

    console.log("Technology Department ID:", techDepartment.id);
    console.log("HR Department ID:", hrDepartment.id);
    console.log("Finance Department ID:", financeDepartment.id);

    console.log("\n=============================================\n");
}

main()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });