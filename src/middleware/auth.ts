import fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function aauthMiddleware(server: FastifyInstance) {
  server.register(require("@fastify/jwt"), {
    secret: "supersecret",
  });

  // Authentication for users
  server.decorate("authenticateUser", async function (req, reply) {
    try {
      await req.jwtVerify();
      const { role } = req.user.payload;
      if (role !== "user") {
        throw new Error("Access denied. Not an user.");
      }
    } catch (err) {
      reply.send(err);
    }
  });

  // Authentication for admin
  server.decorate("authenticateAdmin", async function (req, reply) {
    try {
      await req.jwtVerify();
      // console.log("user....................", req.user);
      // console.log(req.user.tokendata);
      const { role } = req.user.payload;
      if (role !== "admin") {
        throw new Error("Access denied. Not an admin.");
      }
    } catch (err) {
      reply.send(err);
    }
  });

  //to validate usertoken testing api
  server.get<{}>(
    "/validate/admin",
    {
      onRequest: [server.authenticateAdmin],
    },
    async (request, reply) => {
      return request.user;
    }
  );
  //to validate admin testing api
  server.get<{}>(
    "/validate/user",
    {
      onRequest: [server.authenticateUser],
    },
    async (request, reply) => {
      return request.user;
    }
  );
}
