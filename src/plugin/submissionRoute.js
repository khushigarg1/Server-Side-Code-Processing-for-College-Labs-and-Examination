"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = require("../../config");
const axios = require("axios");
const prisma = new client_1.PrismaClient();
function submissionRoute(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/submission/custom", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
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
                    url: `${config_1.DOCKER_URL}submissions/?base64_encoded=true&wait=true`,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: data,
                };
                const response = yield axios.request(config);
                const submissionResult = {
                    data: response.data,
                    input: stdin,
                };
                const apiResponse = {
                    submission_result: submissionResult,
                };
                reply.send(apiResponse);
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.post("/submission/run", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { source_code, language_id, qstnid } = request.body;
                const questions = yield prisma.testCase.findMany({
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
                    const response = yield axios.post(`${config_1.DOCKER_URL}submissions/?base64_encoded=true&wait=true`, submission, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        maxBodyLength: Infinity,
                    });
                    const resultWithInput = {
                        submission_result: response.data,
                        input_data: submission.stdin,
                        output_data: submission.expected_output,
                    };
                    results.push(resultWithInput);
                }
                reply.send(results);
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.post("/submission/submit", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const { userid, source_code, language_id, qstnid, testId } = request.body;
                let language_config = {
                    method: "get",
                    maxBodyLength: Infinity,
                    url: `${config_1.DOCKER_URL}languages/53`,
                    headers: {},
                };
                const languageResponse = yield axios.request(language_config);
                let language_name = (_a = languageResponse === null || languageResponse === void 0 ? void 0 : languageResponse.data) === null || _a === void 0 ? void 0 : _a.name;
                console.log(JSON.stringify(languageResponse.data));
                const testcases = yield prisma.testCase.findMany({
                    where: { question_id: qstnid },
                });
                let total_testcase = testcases.length;
                console.log(total_testcase, language_name);
                const scoreboard = yield prisma.scoreboard.create({
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
                    const response = yield axios.post(`${config_1.DOCKER_URL}?base64_encoded=true&wait=true`, submission, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        maxBodyLength: Infinity,
                    });
                    const submissionRun = yield prisma.submissionRun.create({
                        data: {
                            testcase_id: question.id,
                            status: (_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.status) === null || _c === void 0 ? void 0 : _c.description,
                            error: (_d = response.data) === null || _d === void 0 ? void 0 : _d.stderr,
                            scoreboard_id: scoreboard.id,
                        },
                    });
                    submissionRuns.push(submissionRun);
                    if (((_f = (_e = response.data) === null || _e === void 0 ? void 0 : _e.status) === null || _f === void 0 ? void 0 : _f.id) != 3) {
                        continue;
                    }
                    passedcount++;
                    yield prisma.scoreboard.update({
                        where: { id: scoreboard.id },
                        data: { num_testcases_passed: { increment: 1 } },
                    });
                }
                let finalStatus = "Accepted";
                if (passedcount != total_testcase) {
                    finalStatus = "Not Accepted";
                }
                reply.send({ finalStatus, submissionRuns });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/submission/:userid/:testid", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userid, testid } = request.params;
                const allSubmissions = yield prisma.scoreboard.findMany({
                    where: { user_id: parseInt(userid), test_id: parseInt(testid) },
                    include: { user: true, test: true, SubmissionRun: true },
                });
                const latestSubmission = yield prisma.scoreboard.findFirst({
                    where: { user_id: parseInt(userid), test_id: parseInt(testid) },
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: true,
                        test: true,
                        SubmissionRun: true,
                    },
                });
                reply.send({ allSubmissions, latestSubmission });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/submission/:testid", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { testid } = request.params;
                const distinctUsers = yield prisma.scoreboard.findMany({
                    where: { test_id: parseInt(testid) },
                    distinct: ["user_id"],
                    select: {
                        user_id: true,
                    },
                });
                const latestSubmissions = [];
                for (const user of distinctUsers) {
                    const latestSubmission = yield prisma.scoreboard.findFirst({
                        where: { user_id: user.user_id, test_id: parseInt(testid) },
                        orderBy: { createdAt: "desc" },
                        include: { user: true, test: true, SubmissionRun: true },
                    });
                    latestSubmissions.push(latestSubmission);
                }
                const allSubmissions = yield prisma.scoreboard.findMany({
                    where: { test_id: parseInt(testid) },
                    include: { user: true, test: true, SubmissionRun: true },
                });
                reply.send({ allSubmissions, latestSubmissions });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
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
        server.get("/submissionrun/:scoreboard_id", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { scoreboard_id } = request.params;
                console.log(scoreboard_id);
                const submissionRuns = yield prisma.submissionRun.findMany({
                    where: { scoreboard_id: parseInt(scoreboard_id) },
                    include: {
                        testcase: true,
                        scoreboard: true,
                    },
                });
                reply.send({ submissionRuns });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
    });
}
exports.default = submissionRoute;
