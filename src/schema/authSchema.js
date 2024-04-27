"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = exports.CreateAdmin = exports.CreateUser = void 0;
exports.CreateUser = {
    schema: {
        params: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                customValues: { type: "json" },
                testId: { type: "integer" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    token: { type: "string" },
                },
            },
        },
    },
};
exports.CreateAdmin = {
    schema: {
        params: {
            type: "object",
            properties: {
                email: { type: "string" },
                password: { type: "string" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    token: { type: "string" },
                },
            },
        },
    },
};
exports.LoginUser = {
    schema: {
        params: {
            type: "object",
            properties: {
                email: { type: "string" },
                password: { type: "string" },
                testId: { type: "number" },
            },
        },
        response: {
            200: {
                type: "object",
                properties: {
                    token: { type: "string" },
                },
            },
        },
    },
};
