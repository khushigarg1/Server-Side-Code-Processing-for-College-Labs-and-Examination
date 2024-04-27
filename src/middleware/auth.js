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
const prisma = new client_1.PrismaClient();
function aauthMiddleware(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.register(require("@fastify/jwt"), {
            secret: "supersecret",
        });
        // Authentication for users
        server.decorate("authenticateUser", function (req, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield req.jwtVerify();
                    const { role } = req.user.payload;
                    if (role !== "user") {
                        throw new Error("Access denied. Not an user.");
                    }
                }
                catch (err) {
                    reply.send(err);
                }
            });
        });
        // Authentication for admin
        server.decorate("authenticateAdmin", function (req, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield req.jwtVerify();
                    console.log("user....................", req.user);
                    console.log(req.user.tokendata);
                    const { role } = req.user.payload;
                    if (role !== "admin") {
                        throw new Error("Access denied. Not an admin.");
                    }
                }
                catch (err) {
                    reply.send(err);
                }
            });
        });
        //to validate usertoken testing api
        server.get("/validate/admin", {
            onRequest: [server.authenticateAdmin],
        }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            return request.user;
        }));
        //to validate admin testing api
        server.get("/validate/user", {
            onRequest: [server.authenticateUser],
        }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            return request.user;
        }));
    });
}
exports.default = aauthMiddleware;
