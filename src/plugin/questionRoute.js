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
const questionService_1 = require("../Services/questionService");
const prisma = new client_1.PrismaClient();
function questionRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/question", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { testId, statement } = request.body;
                if (!testId || !statement) {
                    reply
                        .status(400)
                        .send({ error: "Missing testId or statement field" });
                    return;
                }
                const test = yield prisma.test.findUnique({ where: { id: testId } });
                if (!test) {
                    reply
                        .status(404)
                        .send({ error: "Test not found with the provided testId" });
                    return;
                }
                const question = yield (0, questionService_1.createQuestion)({
                    testId,
                    statement,
                });
                reply.send({ data: question });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/question/:id", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = parseInt(request.params.id);
                const question = yield (0, questionService_1.getQuestionById)(questionId);
                if (!question) {
                    reply.status(404).send({ error: "Question not found" });
                    return;
                }
                reply.send({ data: question });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.put("/question/:id", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = parseInt(request.params.id);
                const { statement } = request.body;
                if (!statement) {
                    reply.status(400).send({ error: "Missing statement field" });
                    return;
                }
                const updatedQuestion = yield (0, questionService_1.updateQuestion)(questionId, statement);
                reply.send({ data: updatedQuestion });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.delete(`/question/:id`, { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const question = yield prisma.question.delete({
                    where: { id: Number(id) },
                });
                reply.send({ data: question });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/questions/:testId", 
        // { onRequest: [server.authenticateAdmin] },
        (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const testId = parseInt(request.params.testId);
                const questions = yield (0, questionService_1.getAllQuestionsByTestId)(testId);
                if (!questions || questions.length === 0) {
                    reply
                        .status(404)
                        .send({ error: "No questions found for the provided test ID" });
                    return;
                }
                reply.send({ data: questions });
            }
            catch (error) {
                console.error("Error:", error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
    });
}
exports.default = questionRoutes;
