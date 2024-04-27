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
exports.deleteTestCase = exports.updateTestCase = exports.getTestCaseById = exports.createTestCase = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function createTestCase(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const testCase = yield prisma.testCase.create({
            data: {
                question: { connect: { id: data.questionId } },
                input: data.input,
                output: data.output,
                hidden: data === null || data === void 0 ? void 0 : data.hidden,
            },
        });
        return testCase;
    });
}
exports.createTestCase = createTestCase;
function getTestCaseById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const testCase = yield prisma.testCase.findUnique({
            where: { id },
            include: { question: true },
        });
        return testCase;
    });
}
exports.getTestCaseById = getTestCaseById;
function updateTestCase(id, input, output, hidden) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedTestCase = yield prisma.testCase.update({
            where: { id },
            data: { input, output, hidden },
            include: { question: true },
        });
        return updatedTestCase;
    });
}
exports.updateTestCase = updateTestCase;
function deleteTestCase(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedTestCase = yield prisma.testCase.delete({
            where: { id },
            include: { question: true },
        });
        return deletedTestCase;
    });
}
exports.deleteTestCase = deleteTestCase;
