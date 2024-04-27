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
exports.getAllQuestionsByTestId = exports.updateQuestion = exports.getQuestionById = exports.createQuestion = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function createQuestion(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { testId, statement } = data;
            const question = yield prisma.question.create({
                data: {
                    testId,
                    statement,
                },
            });
            return question;
        }
        catch (error) {
            throw new Error("Error creating question");
        }
    });
}
exports.createQuestion = createQuestion;
function getQuestionById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const question = yield prisma.question.findUnique({
                where: {
                    id,
                },
                include: {
                    test: {
                        include: {
                            User: true,
                            Question: {
                                include: {
                                    TestCase: true,
                                    Scoreboard: true,
                                },
                            },
                            Scoreboard: true,
                        },
                    },
                },
            });
            return question;
        }
        catch (error) {
            throw new Error("Error retrieving question");
        }
    });
}
exports.getQuestionById = getQuestionById;
function updateQuestion(id, statement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedQuestion = yield prisma.question.update({
                where: {
                    id,
                },
                data: {
                    statement,
                },
            });
            return updatedQuestion;
        }
        catch (error) {
            throw new Error("Error updating question");
        }
    });
}
exports.updateQuestion = updateQuestion;
function getAllQuestionsByTestId(testId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const questions = yield prisma.question.findMany({
                where: {
                    testId: testId,
                },
            });
            return questions;
        }
        catch (error) {
            throw new Error("Error retrieving questions by test ID: " + error.message);
        }
    });
}
exports.getAllQuestionsByTestId = getAllQuestionsByTestId;
