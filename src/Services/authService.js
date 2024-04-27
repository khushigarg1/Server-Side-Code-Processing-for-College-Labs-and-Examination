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
exports.loginAdmin = exports.createAdmin = exports.loginUser = exports.createUser = exports.changeAdminPassword = void 0;
// authService.js
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
function changeAdminPassword(email, currentPassword, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = yield prisma.admin.findUnique({ where: { email: email } });
        if (!admin) {
            throw new Error("Admin not found");
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, admin.password);
        if (!isMatch) {
            throw new Error("Invalid current password");
        }
        const hash = yield bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
        const updatedAdmin = yield prisma.admin.update({
            where: { email: email },
            data: { password: hash },
        });
        return updatedAdmin;
    });
}
exports.changeAdminPassword = changeAdminPassword;
function createUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, customValues, testId } = data;
        const hash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password: hash,
                customValues,
                testId,
            },
        });
        return user;
    });
}
exports.createUser = createUser;
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({ where: { email: email } });
        const isMatch = user && (yield bcrypt_1.default.compare(password, user.password));
        return { user, isMatch };
    });
}
exports.loginUser = loginUser;
function createAdmin(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const admin = yield prisma.admin.create({
            data: {
                email,
                password: hash,
            },
        });
        return admin;
    });
}
exports.createAdmin = createAdmin;
function loginAdmin(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = yield prisma.admin.findUnique({ where: { email: email } });
        const isMatch = admin && (yield bcrypt_1.default.compare(password, admin.password));
        return { admin, isMatch };
    });
}
exports.loginAdmin = loginAdmin;
