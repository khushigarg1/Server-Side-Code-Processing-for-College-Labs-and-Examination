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
const testcaseService_1 = require("../Services/testcaseService");
const prisma = new client_1.PrismaClient();
function testcaseRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/testcase", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { questionId, input, output, hidden } = request.body;
                if (!questionId || !input || !output) {
                    reply
                        .status(400)
                        .send({ error: "Missing questionId, input, or output field" });
                    return;
                }
                const question = yield prisma.question.findUnique({
                    where: { id: questionId },
                });
                if (!question) {
                    reply
                        .status(404)
                        .send({ error: "Question not found with provided question id" });
                    return;
                }
                const testCase = yield (0, testcaseService_1.createTestCase)({
                    questionId,
                    input,
                    output,
                    hidden,
                });
                reply.send({ data: testCase });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/testcases/:question_id", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = parseInt(request.params.question_id);
                const testCases = yield prisma.testCase.findMany({
                    where: { question_id: questionId },
                    include: { question: true },
                });
                reply.send({ data: testCases });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/testcase/:id", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const testCaseId = parseInt(request.params.id);
                const testCase = yield (0, testcaseService_1.getTestCaseById)(testCaseId);
                if (!testCase) {
                    reply.status(404).send({ error: "Test case not found" });
                    return;
                }
                reply.send({ data: testCase });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/testcase/sample", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const testCases = yield prisma.testCase.findMany({
                    where: { hidden: false },
                    include: { question: true },
                });
                reply.send({ data: testCases });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/testcase/hidden", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const testCases = yield prisma.testCase.findMany({
                    where: { hidden: true },
                    include: { question: true },
                });
                reply.send({ data: testCases });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.put("/testcase/:id", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const testCaseId = parseInt(request.params.id);
                const { input, output, hidden } = request.body;
                if (!input || !output) {
                    reply.status(400).send({ error: "Missing input or output field" });
                    return;
                }
                const updatedTestCase = yield (0, testcaseService_1.updateTestCase)(testCaseId, input, output, hidden);
                reply.send({ data: updatedTestCase });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.delete(`/testcase/:id`, { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const testCase = yield (0, testcaseService_1.deleteTestCase)(Number(id));
                reply.send({ data: testCase });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
    });
}
exports.default = testcaseRoutes;
