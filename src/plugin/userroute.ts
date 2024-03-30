import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface opts {
  testName: string;
  testDuration: number;
  numOfQuestion: number;
  group: string;
  status: string;
}
interface IByIdParam {
  id: number;
}
export default async function testRoutes(server: FastifyInstance) {
  server.post<{ Body: opts }>("/test", async (request, reply) => {
    const { testName, testDuration, numOfQuestion, group, status } =
      request.body;
    const test = await prisma.test.create({
      data: {
        testName,
        testDuration,
        numOfQuestion,
        group,
        status,
      },
    });
    reply.send(test);
  });
  server.get<{ Params: IByIdParam }>("/test/:id", async (request, reply) => {
    const { id } = request.params;
    const test = await prisma.test.findUnique({
      where: { id: Number(id) },
    });
    reply.send(test);
  });
}
