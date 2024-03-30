import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import testRoutes from "./plugin/testroute";
import aauthMiddleware from "./middleware/auth";
import AuthRoutes from "./plugin/authRoute";

const server = fastify({ logger: true });
const prisma = new PrismaClient();

// server.register(aauthMiddleware);
aauthMiddleware(server);
server.register(testRoutes);
server.register(AuthRoutes);

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
    await server.listen({ port: 8080 });
  } catch (err) {
    console.log(err);
    server.log.error(err);
    // process.exit(1)
  }
};
start();
