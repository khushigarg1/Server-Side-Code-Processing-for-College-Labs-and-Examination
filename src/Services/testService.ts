// testController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createTest(testData) {
  const { testName, testDuration, numOfQuestion, group, status } = testData;
  const test = await prisma.test.create({
    data: {
      testName,
      testDuration,
      numOfQuestion,
      group,
      status,
    },
  });
  return test;
}

export async function getTestById(id) {
  const test = await prisma.test.findUnique({
    where: { id: Number(id) },
  });
  return test;
}

export async function updateTestById(id, data) {
  try {
    const updatedTest = await prisma.test.update({
      where: { id: parseInt(id) },
      data: { ...data },
    });
    return updatedTest;
  } catch (error) {
    throw new Error("Failed to update test");
  }
}
