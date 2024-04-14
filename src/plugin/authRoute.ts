import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CreateUser, CreateAdmin, LoginUser } from "../schema/authSchema";
import bcrypt from "bcrypt";
import { changeAdminPassword } from "../Services/authService";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
export default async function AuthRoutes(server: FastifyInstance) {
  //post request for an user
  server.post<{ Body: CreateUser }>("/user/signup", async (request, reply) => {
    const { name, email, password, customValues, testId } = request.body;

    const testExists = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!testExists) {
      return reply.code(404).send({
        message: "Test not found",
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const userdata = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        customValues,
        testId,
      },
    });
    const payload = {
      userId: userdata.id,
      name: userdata.name,
      password: userdata.password,
      role: "user",
      testId: userdata.testId,
    };
    const token = server.jwt.sign({ payload });
    reply.send({ token });
  });

  server.post<{ Body: LoginUser }>("/user/login", async (req, reply) => {
    const { email, password, testId } = req.body;
    const testExists = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!testExists) {
      return reply.code(404).send({
        message: "Test not found",
      });
    }

    const user = await prisma.user.findUnique({
      where: { UniqueEmailTestId: { email, testId } },
    });

    if (!user) {
      return reply.code(401).send({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({
        message: "Invalid password",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: "user",
      testid: user.testId,
      password: user.password,
    };

    const token = server.jwt.sign({ payload });
    reply.send({ token, data: user });
  });

  //get admin details
  server.post<{ Body: CreateAdmin }>("/admin/login", async (req, reply) => {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email: email } });
    const isMatch = admin && (await bcrypt.compare(password, admin.password));
    if (!admin || !isMatch) {
      return reply.code(401).send({
        message: "Invalid email or password",
      });
    }
    const payload = {
      id: admin.id,
      email: admin.email,
      password: password,
      role: "admin",
    };
    // console.log(payload);
    const token = server.jwt.sign({ payload });
    reply.send({ token, data: admin });
  });

  //Create admin
  server.post<{ Body: CreateAdmin }>(
    "/admin/signup",
    async (request, reply) => {
      const { email, password } = request.body;
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const userdata = await prisma.admin.create({
        data: {
          email,
          password: hash,
        },
      });
      const payload = {
        email: userdata.email,
        password: userdata.password,
        role: "admin",
      };
      const token = server.jwt.sign({ payload });
      reply.send({ token });
    }
  );

  server.post<{
    Body: { email: string; currentPassword: string; newPassword: string };
  }>(
    "/admin/change-password",
    { onRequest: [server.authenticateAdmin] },
    async (req, reply) => {
      const { email, currentPassword, newPassword } = req.body;

      try {
        const updatedAdmin = await changeAdminPassword(
          email,
          currentPassword,
          newPassword
        );
        reply.send({
          message: "Password changed successfully",
          admin: updatedAdmin,
        });
      } catch (error) {
        reply.code(400).send({ message: error.message });
      }
    }
  );
}
