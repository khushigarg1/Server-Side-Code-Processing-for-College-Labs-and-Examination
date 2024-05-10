import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { encodeToBase64, decodeFromBase64 } from "../utilss";
import { DOCKER_URL } from "../../config";
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
    // { onRequest: [server.authenticateAdmin] },
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
          url: `${DOCKER_URL}submissions/?base64_encoded=true&wait=true`,
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
    // { onRequest: [server.authenticateAdmin] },
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
            stdin: question.input,
            expected_output: question.output,
            // stdin: encodeToBase64(question.input),
            // expected_output: encodeToBase64("Output: " + question.output),   //for testign with question_id 7
            // expected_output: encodeToBase64(question.output),
          };
          const response = await axios.post(
            `${DOCKER_URL}submissions/?base64_encoded=true&wait=true`,
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

  server.post<{
    Body: {
      userid: number;
      language_id: number;
      source_code: string;
      testId: number;
      qstnid: number;
    };
  }>(
    "/submission/submit",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { userid, source_code, language_id, qstnid, testId } =
          request.body;

        let language_config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${DOCKER_URL}languages/53`,
          headers: {},
        };
        const languageResponse = await axios.request(language_config);
        let language_name = languageResponse?.data?.name;

        const testcases = await prisma.testCase.findMany({
          where: { question_id: qstnid },
        });
        let total_testcase = testcases.length;
        const scoreboard = await prisma.scoreboard.create({
          data: {
            user: { connect: { id: userid } },
            question: { connect: { id: qstnid } },
            test: { connect: { id: testId } },
            question_language: language_name,
            total_num_testcases: total_testcase,
            num_testcases_passed: 0,
          },
        });
        const submissionRuns = [];
        let passedcount = 0;
        for (const question of testcases) {
          const submission = {
            language_id: language_id,
            source_code: source_code,
            stdin: question.input,
            expected_output: question.output,
            // stdin: encodeToBase64(question.input),
            // expected_output: encodeToBase64(question.output),
          };

          const response = await axios.post(
            `${DOCKER_URL}/submissions/?base64_encoded=true&wait=true`,
            submission,
            {
              headers: {
                "Content-Type": "application/json",
              },
              maxBodyLength: Infinity,
            }
          );

          const submissionRun = await prisma.submissionRun.create({
            data: {
              testcase_id: question.id,
              status: response.data?.status?.description,
              error: response.data?.stderr,
              scoreboard_id: scoreboard.id,
            },
          });

          submissionRuns.push(submissionRun);

          if (response.data?.status?.id != 3) {
            continue;
          }
          passedcount++;
          await prisma.scoreboard.update({
            where: { id: scoreboard.id },
            data: { num_testcases_passed: { increment: 1 } },
          });
        }

        let finalStatus = "Accepted";
        if (passedcount != total_testcase) {
          finalStatus = "Not Accepted";
        }

        reply.send({ finalStatus, submissionRuns });
      } catch (error) {
        // console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get<{
    Params: { userid: number; testid: number };
  }>(
    "/submission/:userid/:testid",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { userid, testid } = request.params;

        const allSubmissions = await prisma.scoreboard.findMany({
          where: { user_id: parseInt(userid), test_id: parseInt(testid) },
          include: { user: true, test: true, SubmissionRun: true },
        });

        const latestSubmission = await prisma.scoreboard.findFirst({
          where: { user_id: parseInt(userid), test_id: parseInt(testid) },
          orderBy: { createdAt: "desc" },
          include: {
            user: true,
            test: true,
            SubmissionRun: true,
          },
        });

        reply.send({ allSubmissions, latestSubmission });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  server.get<{
    Params: { testid: number };
  }>(
    "/submission/:testid",
    // { onRequest: [server.authenticateAdmin] },
    async (request, reply) => {
      try {
        const { testid } = request.params;
        const distinctUsers = await prisma.scoreboard.findMany({
          where: { test_id: parseInt(testid) },
          distinct: ["user_id"],
          select: {
            user_id: true,
          },
        });

        const latestSubmissions = [];

        for (const user of distinctUsers) {
          const latestSubmission = await prisma.scoreboard.findFirst({
            where: { user_id: user.user_id, test_id: parseInt(testid) },
            orderBy: { createdAt: "desc" },
            include: { user: true, test: true, SubmissionRun: true },
          });

          latestSubmissions.push(latestSubmission);
        }

        const allSubmissions = await prisma.scoreboard.findMany({
          where: { test_id: parseInt(testid) },
          include: { user: true, test: true, SubmissionRun: true },
        });

        reply.send({ allSubmissions, latestSubmissions });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // server.get<{
  //   Params: { testid: number };
  // }>(
  //   "/submission/:testid",
  //   { onRequest: [server.authenticateAdmin] },
  //   async (request, reply) => {
  //     try {
  //       const { testid } = request.params;

  //       const allSubmissions = await prisma.scoreboard.findMany({
  //         where: { test_id: parseInt(testid) },
  //         include: { user: true, test: true, SubmissionRun: true },
  //       });

  //       const latestSubmission = await prisma.scoreboard.findFirst({
  //         where: { test_id: parseInt(testid) },
  //         orderBy: { createdAt: "desc" },
  //         include: { user: true, test: true, SubmissionRun: true },
  //       });

  //       reply.send({ allSubmissions, latestSubmission });
  //     } catch (error) {
  //       console.error("Error:", error);
  //       reply.status(500).send({ error: "Internal Server Error" });
  //     }
  //   }
  // );
  server.get<{ Params: { scoreboard_id: number } }>(
    "/submissionrun/:scoreboard_id",
    async (request, reply) => {
      try {
        const { scoreboard_id } = request.params;
        // console.log(scoreboard_id);

        const submissionRuns = await prisma.submissionRun.findMany({
          where: { scoreboard_id: parseInt(scoreboard_id) },
          include: {
            testcase: true,
            scoreboard: true,
          },
        });

        reply.send({ submissionRuns });
      } catch (error) {
        console.error("Error:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
