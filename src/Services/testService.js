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
exports.updateTestById = exports.getTestById = exports.createTest = void 0;
// testController.js
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function createTest(testData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { testName, testDuration, numOfQuestion, group, status } = testData;
        const test = yield prisma.test.create({
            data: {
                testName,
                testDuration,
                numOfQuestion,
                group,
                status,
            },
        });
        return test;
    });
}
exports.createTest = createTest;
function getTestById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(id);
        const test = yield prisma.test.findUnique({
            where: { id: Number(id) },
            include: {
                User: true,
                Question: {
                    include: {
                        TestCase: true,
                        Scoreboard: true,
                    },
                },
                Scoreboard: true,
                // {
                //   include: {
                //     User: true,
                //     Test: true,
                //   },
                // },
            },
        });
        // console.log(test);
        if (test && test.Question) {
            test.Question.forEach((question) => {
                let hiddenCount = 0;
                let totalcases = 0;
                if (question.TestCase) {
                    question.TestCase.forEach((testCase) => {
                        if (testCase.hidden) {
                            hiddenCount++;
                        }
                        totalcases++;
                    });
                }
                question.hiddenCount = hiddenCount;
                question.totalcases = totalcases;
            });
        }
        return test;
    });
}
exports.getTestById = getTestById;
function updateTestById(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedTest = yield prisma.test.update({
                where: { id: parseInt(id) },
                data: Object.assign({}, data),
            });
            return updatedTest;
        }
        catch (error) {
            throw new Error("Failed to update test");
        }
    });
}
exports.updateTestById = updateTestById;
