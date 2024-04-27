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
const testService_1 = require("../Services/testService");
const prisma = new client_1.PrismaClient();
function testRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post("/test", { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = request.body;
                const test = yield (0, testService_1.createTest)(data);
                reply.send({ data: test });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/test", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tests = yield prisma.test.findMany();
                reply.send({ data: tests });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.get("/test/:id", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const test = yield (0, testService_1.getTestById)(id);
                if (!test) {
                    reply.status(404).send({ error: "Test not found" });
                    return;
                }
                reply.send({ data: test });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.delete(`/test/:id`, { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                // console.log("idd", id);
                const test = yield prisma.test.delete({
                    where: { id: Number(id) },
                });
                // console.log(test);
                reply.send({ data: test });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
        server.put(`/test/:id`, { onRequest: [server.authenticateAdmin] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const data = request.body;
                const updatedTest = yield (0, testService_1.updateTestById)(id, data);
                reply.send({ data: updatedTest });
            }
            catch (error) {
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
    });
}
exports.default = testRoutes;
