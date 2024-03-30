// authService.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export async function createUser(data) {
  const { name, email, password, customValues, testId } = data;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      customValues,
      testId,
    },
  });
  return user;
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email: email } });
  const isMatch = user && (await bcrypt.compare(password, user.password));
  return { user, isMatch };
}

export async function createAdmin(email, password) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = await prisma.admin.create({
    data: {
      email,
      password: hash,
    },
  });
  return admin;
}

export async function loginAdmin(email, password) {
  const admin = await prisma.admin.findUnique({ where: { email: email } });
  const isMatch = admin && (await bcrypt.compare(password, admin.password));
  return { admin, isMatch };
}
