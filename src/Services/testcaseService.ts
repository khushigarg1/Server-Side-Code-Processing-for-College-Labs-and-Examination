import { PrismaClient, TestCase } from "@prisma/client";

const prisma = new PrismaClient();

export async function createTestCase(data: {
  questionId: number;
  input: string;
  output: string;
  hidden: boolean;
}): Promise<TestCase> {
  const testCase = await prisma.testCase.create({
    data: {
      question: { connect: { id: data.questionId } },
      input: data.input,
      output: data.output,
      hidden: data?.hidden,
    },
  });
  return testCase;
}

export async function getTestCaseById(id: number): Promise<TestCase | null> {
  const testCase = await prisma.testCase.findUnique({
    where: { id },
    include: { question: true },
  });
  return testCase;
}

export async function updateTestCase(
  id: number,
  input: string,
  output: string,
  hidden: boolean
): Promise<TestCase | null> {
  const updatedTestCase = await prisma.testCase.update({
    where: { id },
    data: { input, output, hidden },
    include: { question: true },
  });
  return updatedTestCase;
}

export async function deleteTestCase(id: number): Promise<TestCase | null> {
  const deletedTestCase = await prisma.testCase.delete({
    where: { id },
    include: { question: true },
  });
  return deletedTestCase;
}
