/**
 * @jest-environment node
 */
import 'openai/shims/node';

import { NextRequest } from "next/server";
import { POST } from "../route";
import * as dbConfig from "@/dbConfig/dbConfig";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import UserNew from "@/models/userModel";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

jest.mock("@/dbConfig/dbConfig", () => ({ connect: jest.fn() }));
jest.mock("@/models/quizModel");
jest.mock("@/models/questionModel");
jest.mock("@/models/userModel");
jest.mock("jsonwebtoken");
jest.mock("openai");

describe("POST /api/ai-quiz/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // stub DB connect
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any, token?: string): NextRequest {
    return {
      json: async () => body,
      cookies: { get: (_: string) => token ? { value: token } : undefined },
    } as any;
  }

  it("returns 201 and new quiz ID on success", async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.GITHUB_TOKEN = "fake-token";

    // 1) Mock JWT.verify to return a valid ObjectId string
    (jwt.verify as jest.Mock).mockReturnValue({
      id: "507f1f77bcf86cd799439011"
    });

    // 2) Stub OpenAI chat completion
    const fakeContent = JSON.stringify([{
      question_text: "Q1?",
      options: ["A","B","C","D"],
      correct_answer: "B"
    }]);
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: fakeContent } }]
    });
    (OpenAI as any).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    }));

    // 3) Capture the Quiz instance so we can inspect it after POST()
    let quizInst: any;
    (Quiz as any).mockImplementation(() => {
      quizInst = {
        _id: "quiz123",
        total_points: 0,
        save: jest.fn()
      };
      // make save() resolve to the instance (route ignores the return value anyway)
      quizInst.save.mockResolvedValue(quizInst);
      return quizInst;
    });

    // 4) Stub the rest of your models
    (UserNew.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
    (Question.insertMany as jest.Mock).mockResolvedValue([{}]);

    // 5) Fire the request
    const req = makeReq({
      topic: "Math",
      numQuestions: 1,
      duration: 10,
      questionConfigs: [{ points: 5 }]
    }, "valid-token");

    const res = await POST(req);

    // 6) Assertions
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      quizId: "quiz123",
      message: "AI Quiz generated successfully"
    });

    // OpenAI was called
    expect(mockCreate).toHaveBeenCalled();

    // And your route should have bumped total_points from 0 → 5
    expect(quizInst.total_points).toBe(5);
  });
});
