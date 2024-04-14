import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createTestCase,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
} from "../Services/testcaseService";

const prisma = new PrismaClient();

export default async function testcaseRoutes(server: FastifyInstance) {
  server.post<{
    Body: {
      questionId: number;
      input: string;
      output: string;
      hidden: boolean;
    };
  }>(
    "/testcase",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { questionId, input, output, hidden } = request.body;
        if (!questionId || !input || !output) {
          reply
            .status(400)
            .send({ error: "Missing questionId, input, or output field" });
          return;
        }

        const question = await prisma.question.findUnique({
          where: { id: questionId },
        });
        if (!question) {
          reply
            .status(404)
            .send({ error: "Question not found with provided question id" });
          return;
        }
        const testCase = await createTestCase({
          questionId,
          input,
          output,
          hidden,
        });

        reply.send({ data: testCase });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get<{ Params: { questionId: number } }>(
    "/testcases/:question_id",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const questionId = parseInt(request.params.question_id);
        const testCases = await prisma.testCase.findMany({
          where: { question_id: questionId },
          include: { question: true },
        });

        reply.send({ data: testCases });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get<{ Params: { id: number } }>(
    "/testcase/:id",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const testCaseId = parseInt(request.params.id);
        const testCase = await getTestCaseById(testCaseId);

        if (!testCase) {
          reply.status(404).send({ error: "Test case not found" });
          return;
        }

        reply.send({ data: testCase });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get(
    "/testcase/sample",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const testCases = await prisma.testCase.findMany({
          where: { hidden: false },
          include: { question: true },
        });
        reply.send({ data: testCases });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  server.get(
    "/testcase/hidden",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const testCases = await prisma.testCase.findMany({
          where: { hidden: true },
          include: { question: true },
        });
        reply.send({ data: testCases });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.put<{
    Params: { id: number };
    Body: { input: string; output: string; hidden: boolean };
  }>(
    "/testcase/:id",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const testCaseId = parseInt(request.params.id);
        const { input, output, hidden } = request.body;

        if (!input || !output) {
          reply.status(400).send({ error: "Missing input or output field" });
          return;
        }

        const updatedTestCase = await updateTestCase(
          testCaseId,
          input,
          output,
          hidden
        );

        reply.send({ data: updatedTestCase });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.delete<{ Params: { id: number } }>(
    `/testcase/:id`,
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const testCase = await deleteTestCase(Number(id));
        reply.send({ data: testCase });
      } catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
