import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
  getAllQuestionsByTestId,
} from "../Services/questionService";
const prisma = new PrismaClient();

export default async function questionRoutes(server: FastifyInstance) {
  server.post<{
    Body: { testId: number; statement: string };
  }>(
    "/question",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { testId, statement } = request.body;

        if (!testId || !statement) {
          reply
            .status(400)
            .send({ error: "Missing testId or statement field" });
          return;
        }

        const test = await prisma.test.findUnique({ where: { id: testId } });
        if (!test) {
          reply
            .status(404)
            .send({ error: "Test not found with the provided testId" });
          return;
        }
        const question = await createQuestion({
          testId,
          statement,
        });

        reply.send({ data: question });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get<{ Params: { id: string } }>(
    "/question/:id",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const questionId = parseInt(request.params.id);
        const question = await getQuestionById(questionId);

        if (!question) {
          reply.status(404).send({ error: "Question not found" });
          return;
        }

        reply.send({ data: question });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  server.put<{ Params: { id: string }; Body: { statement: string } }>(
    "/question/:id",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const questionId = parseInt(request.params.id);
        const { statement } = request.body;

        if (!statement) {
          reply.status(400).send({ error: "Missing statement field" });
          return;
        }

        const updatedQuestion = await updateQuestion(questionId, statement);

        reply.send({ data: updatedQuestion });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  server.delete<{ Params: { id: string } }>(
    `/question/:id`,
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const question = await prisma.question.delete({
          where: { id: Number(id) },
        });
        reply.send({ data: question });
      } catch (error) {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  server.get<{ Params: { testId: string } }>(
    "/questions/:testId",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const testId = parseInt(request.params.testId);
        const questions = await getAllQuestionsByTestId(testId);

        if (!questions || questions.length === 0) {
          reply
            .status(404)
            .send({ error: "No questions found for the provided test ID" });
          return;
        }

        reply.send({ data: questions });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
