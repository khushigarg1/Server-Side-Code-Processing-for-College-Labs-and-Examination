import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CreateUser, CreateAdmin, LoginUser } from "../schema/authSchema";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
export default async function AuthRoutes(server: FastifyInstance) {
  //post request for an user
  server.post<{ Body: CreateUser }>("/user/signup", async (request, reply) => {
    const { name, email, password, customValues, testId } = request.body;
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
    };
    const token = server.jwt.sign({ payload });
    reply.send({ token });
  });

  //get user details
  server.post<{ Body: LoginUser }>("/user/login", async (req, reply) => {
    const { email, password, testId } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email, testId: testId },
    });
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!user || !isMatch) {
      return reply.code(401).send({
        message: "Invalid email or password",
      });
    }
    const payload = {
      id: user.id,
      email: user.email,
      password: password,
      role: "user",
      testid: user?.testId,
    };
    // console.log(payload);
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
}
