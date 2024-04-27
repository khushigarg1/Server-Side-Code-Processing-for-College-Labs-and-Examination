"use strict";
// import fastify from "fastify";
// import { PrismaClient } from "@prisma/client";
// import testRoutes from "./plugin/testroute";
// import aauthMiddleware from "./middleware/auth";
// import AuthRoutes from "./plugin/authRoute";
// import questionRoutes from "./plugin/questionRoute";
// import testcaseRoutes from "./plugin/testcaseroute";
// import submissionRoute from "./plugin/submissionRoute";
// // import multipart from "@fastify/multipart";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import cors from "@fastify/cors";
// import ForgetRoutes from "./plugin/forgetroutes";
// const server = fastify({ logger: true });
// const prisma = new PrismaClient();
// // server.register(aauthMiddleware);
// aauthMiddleware(server);
// // server.register(multipart);
// server.register(cors, {});
// server.register(AuthRoutes);
// // server.register(ForgetRoutes);
// server.register(testRoutes);
// server.register(questionRoutes);
// server.register(testcaseRoutes);
// server.register(submissionRoute);
// server.get("/", function (request, reply) {
//   reply.send({ hello: "world" });
// });
// // const listeners = ['SIGINT', 'SIGTERM']
// // listeners.forEach((signal) => {
// // 	process.on(signal, async () => {
// // 		await server.close()
// // 		process.exit(0)
// // 	})
// // })
// const start = async () => {
//   try {
//     await server.listen({ port: process.env.PORT });
//   } catch (err) {
//     console.log(err);
//     server.log.error(err);
//     // process.exit(1)
//   }
// };
// start();
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const testroute_1 = __importDefault(require("./plugin/testroute"));
const auth_1 = __importDefault(require("./middleware/auth"));
const authRoute_1 = __importDefault(require("./plugin/authRoute"));
const questionRoute_1 = __importDefault(require("./plugin/questionRoute"));
const testcaseroute_1 = __importDefault(require("./plugin/testcaseroute"));
const submissionRoute_1 = __importDefault(require("./plugin/submissionRoute"));
// import multipart from "@fastify/multipart";
const cors_1 = __importDefault(require("@fastify/cors"));
const server = (0, fastify_1.default)({ logger: true });
const prisma = new client_1.PrismaClient();
// server.register(aauthMiddleware);
(0, auth_1.default)(server);
// server.register(multipart);
server.register(cors_1.default, {});
server.register(authRoute_1.default);
// server.register(ForgetRoutes);
server.register(testroute_1.default);
server.register(questionRoute_1.default);
server.register(testcaseroute_1.default);
server.register(submissionRoute_1.default);
server.get("/", function (request, reply) {
    reply.send({ hello: "world" });
});
// const listeners = ['SIGINT', 'SIGTERM']
// listeners.forEach((signal) => {
// 	process.on(signal, async () => {
// 		await server.close()
// 		process.exit(0)
// 	})
// })
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.listen({ port: process.env.PORT });
    }
    catch (err) {
        console.log(err);
        server.log.error(err);
        // process.exit(1)
    }
});
start();
