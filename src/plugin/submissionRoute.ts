import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { encodeToBase64, decodeFromBase64 } from "../utilss";
const axios = require("axios");
const prisma = new PrismaClient();

export default async function submissionRoute(server: FastifyInstance) {
  server.post<{
    Body: {
      source_code: string;
      language_id: number;
      stdin: string;
    };
  }>(
    "/submission/custom",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { source_code, language_id, stdin } = request.body;

        let data = JSON.stringify({
          source_code: source_code,
          language_id: language_id,
          stdin: stdin,
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "http://localhost:2358/submissions/?base64_encoded=true&wait=true",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };

        const response = await axios.request(config);
        const submissionResult = {
          data: response.data,
          input: stdin,
        };

        const apiResponse = {
          submission_result: submissionResult,
        };

        reply.send(apiResponse);
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.post<{
    Body: {
      source_code: string;
      language_id: number;
      // testid: number;
      qstnid: number;
    };
  }>(
    "/submission/run",
    { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { source_code, language_id, qstnid } = request.body;

        const questions = await prisma.testCase.findMany({
          where: { question_id: qstnid, hidden: false },
        });
        if (!questions || questions.length === 0) {
          return reply.send("No test cases found for this question ID.");
        }

        const results = [];
        for (const question of questions) {
          const submission = {
            language_id: language_id,
            source_code: source_code,
            stdin: encodeToBase64(question.input),
            // expected_output: encodeToBase64("Output: " + question.output),   //for testign with question_id 7
            expected_output: encodeToBase64(question.output),
          };
          const response = await axios.post(
            "http://localhost:2358/submissions/?base64_encoded=true&wait=true",
            submission,
            {
              headers: {
                "Content-Type": "application/json",
              },
              maxBodyLength: Infinity,
            }
          );

          const resultWithInput = {
            submission_result: response.data,
            input_data: submission.stdin,
            output_data: submission.expected_output,
          };

          results.push(resultWithInput);
        }

        reply.send(results);
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
