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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const authService_1 = require("../Services/authService");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
function AuthRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        //post request for an user
        server.post("/user/signup", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, customValues, testId } = request.body;
            const testExists = yield prisma.test.findUnique({
                where: { id: testId },
            });
            if (!testExists) {
                return reply.code(404).send({
                    message: "Test not found",
                });
            }
            const hash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
            const userdata = yield prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                    customValues,
                    testId,
                },
            });
            const payload = {
                userId: userdata.id,
                name: userdata.name,
                password: userdata.password,
                role: "user",
                testId: userdata.testId,
            };
            const token = server.jwt.sign({ payload });
            reply.send({ token });
        }));
        server.post("/user/login", (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password, testId } = req.body;
            const testExists = yield prisma.test.findUnique({
                where: { id: testId },
            });
            if (!testExists) {
                return reply.code(404).send({
                    message: "Test not found",
                });
            }
            const user = yield prisma.user.findUnique({
                where: { UniqueEmailTestId: { email, testId } },
            });
            if (!user) {
                return reply.code(401).send({
                    message: "User not found",
                });
            }
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return reply.code(401).send({
                    message: "Invalid password",
                });
            }
            const payload = {
                id: user.id,
                email: user.email,
                role: "user",
                testid: user.testId,
                password: user.password,
            };
            const token = server.jwt.sign({ payload });
            reply.send({ token, data: user });
        }));
        //get admin details
        server.post("/admin/login", (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const admin = yield prisma.admin.findUnique({ where: { email: email } });
            const isMatch = admin && (yield bcrypt_1.default.compare(password, admin.password));
            if (!admin || !isMatch) {
                return reply.code(401).send({
                    message: "Invalid email or password",
                });
            }
            const payload = {
                id: admin.id,
                email: admin.email,
                password: password,
                role: "admin",
            };
            // console.log(payload);
            const token = server.jwt.sign({ payload });
            reply.send({ token, data: admin });
        }));
        //Create admin
        server.post("/admin/signup", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            const hash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
            const userdata = yield prisma.admin.create({
                data: {
                    email,
                    password: hash,
                },
            });
            const payload = {
                email: userdata.email,
                password: userdata.password,
                role: "admin",
            };
            const token = server.jwt.sign({ payload });
            reply.send({ token });
        }));
        server.post("/admin/change-password", { onRequest: [server.authenticateAdmin] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, currentPassword, newPassword } = req.body;
            try {
                const updatedAdmin = yield (0, authService_1.changeAdminPassword)(email, currentPassword, newPassword);
                reply.send({
                    message: "Password changed successfully",
                    admin: updatedAdmin,
                });
            }
            catch (error) {
                reply.code(400).send({ message: error.message });
            }
        }));
    });
}
exports.default = AuthRoutes;
