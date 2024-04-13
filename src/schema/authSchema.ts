export const CreateUser = {
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
export const CreateAdmin = {
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
export const LoginUser = {
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
