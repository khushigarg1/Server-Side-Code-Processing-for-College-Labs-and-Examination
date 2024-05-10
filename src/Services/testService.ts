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
  // console.log(id);
  const test = await prisma.test.findUnique({
    where: { id: Number(id) },
    include: {
      User: true,
      Question: {
        include: {
          TestCase: true,
          Scoreboard: true,
        },
      },
      Scoreboard: true,
      // {
      //   include: {
      //     User: true,
      //     Test: true,
      //   },
      // },
    },
  });
  // console.log(test);
  if (test && test.Question) {
    test.Question.forEach((question) => {
      let hiddenCount = 0;
      let totalcases = 0;
      if (question.TestCase) {
        question.TestCase.forEach((testCase) => {
          if (testCase.hidden) {
            hiddenCount++;
          }
          totalcases++;
        });
      }
      question.hiddenCount = hiddenCount;
      question.totalcases = totalcases;
    });
  }
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
