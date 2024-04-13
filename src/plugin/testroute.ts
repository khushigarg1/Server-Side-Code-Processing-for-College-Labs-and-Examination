import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from "@prisma/client";
import { opts, IByIdParam } from "../schema/testSchema";
import {
  createTest,
  getTestById,
  updateTestById,
} from "../Services/testService";

const prisma = new PrismaClient();

export default async function testRoutes(server: FastifyInstance) {
  server.post<{ Body: opts }>(
    "/test",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const data = request.body;
        const test = await createTest(data);
        reply.send({ data: test });
      } catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  server.get("/test", async (request, reply) => {
    try {
      const tests = await prisma.test.findMany();
      reply.send({ data: tests });
    } catch (error) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  server.get<{ Params: IByIdParam }>("/test/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const test = await getTestById(id);
      if (!test) {
        reply.status(404).send({ error: "Test not found" });
        return;
      }
      reply.send({ data: test });
    } catch (error) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  server.delete<{ Params: IByIdParam }>(
    `/test/:id`,
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        // console.log("idd", id);
        const test = await prisma.test.delete({
          where: { id: Number(id) },
        });
        // console.log(test);
        reply.send({ data: test });
      } catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.put<{ Params: IByIdParam; Body: opts }>(
    `/test/:id`,
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const data = request.body;
        const updatedTest = await updateTestById(id, data);
        reply.send({ data: updatedTest });
      } catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
