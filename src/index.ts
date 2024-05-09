// import fastify from "fastify";
// import { PrismaClient } from "@prisma/client";
// import testRoutes from "./plugin/testroute";
// import aauthMiddleware from "./middleware/auth";
// import AuthRoutes from "./plugin/authRoute";
// import questionRoutes from "./plugin/questionRoute";
// import testcaseRoutes from "./plugin/testcaseroute";
// import submissionRoute from "./plugin/submissionRoute";
// // import multipart from "@fastify/multipart";

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

import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import testRoutes from "./plugin/testroute";
import aauthMiddleware from "./middleware/auth";
import AuthRoutes from "./plugin/authRoute";
import questionRoutes from "./plugin/questionRoute";
import testcaseRoutes from "./plugin/testcaseroute";
import submissionRoute from "./plugin/submissionRoute";
// import multipart from "@fastify/multipart";

import cors from "@fastify/cors";
import ForgetRoutes from "./plugin/forgetroutes";

const server = fastify({ logger: true });
const prisma = new PrismaClient();

// server.register(aauthMiddleware);
aauthMiddleware(server);
// server.register(multipart);
server.register(cors, {});
server.register(AuthRoutes);
// server.register(ForgetRoutes);
server.register(testRoutes);
server.register(questionRoutes);
server.register(testcaseRoutes);
server.register(submissionRoute);

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
const start = async () => {
  try {
    await server.listen({ port: process.env.PORT, host: "0.0.0.0" });
  } catch (err) {
    // console.log(err);
    server.log.error(err);
    // process.exit(1)
  }
};
start();
