import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createQuestion(data: {
  testId: number;
  statement: string;
}) {
  try {
    const { testId, statement } = data;
    const question = await prisma.question.create({
      data: {
        testId,
        statement,
      },
    });
    return question;
  } catch (error) {
    throw new Error("Error creating question");
  }
}

export async function getQuestionById(id: number): Promise<any> {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        test: {
          include: {
            User: true,
            Question: {
              include: {
                TestCase: true,
                Scoreboard: true,
              },
            },
            Scoreboard: true,
          },
        },
      },
    });
    return question;
  } catch (error) {
    throw new Error("Error retrieving question");
  }
}

export async function updateQuestion(
  id: number,
  statement: string
): Promise<any> {
  try {
    const updatedQuestion = await prisma.question.update({
      where: {
        id,
      },
      data: {
        statement,
      },
    });
    return updatedQuestion;
  } catch (error) {
    throw new Error("Error updating question");
  }
}

export async function getAllQuestionsByTestId(testId: number) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        testId: testId,
      },
    });

    return questions;
  } catch (error) {
    throw new Error("Error retrieving questions by test ID: " + error.message);
  }
}
