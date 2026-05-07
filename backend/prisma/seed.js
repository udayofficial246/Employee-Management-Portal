import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role'
    }
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      email: 'admin@example.com'
    },
    update: {},
    create: {
      employeeCode: 'ADM001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id
    }
  });

  console.log(adminUser);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });