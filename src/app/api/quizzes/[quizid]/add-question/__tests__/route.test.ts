/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { POST } from "../route";
import * as dbConfig from "@/dbConfig/dbConfig";
import Question from "@/models/questionModel";
import { NextRequest } from "next/server";

jest.mock("@/dbConfig/dbConfig", () => ({ connect: jest.fn() }));
jest.mock("@/models/questionModel");

describe("POST /api/quiz/[quizid]/question", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ham connect() stub kar rahe hain taake real database request na ho
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any): NextRequest {
    return { 
      json: async () => body 
    } as any;
  }

  function makeCtx(id: string) {
    return { params: { quizid: id } } as any;
  }

  it("returns 400 if required fields are missing", async () => {
    // agar question_text ya correct_answer nahin diya, to 400 chahiye
    const res = await POST(
      makeReq({ question_type: "MCQ", options: ["A","B"] }),
      makeCtx("507f1f77bcf86cd799439011")
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing required fields" });
  });

  it("returns 201 when question is created successfully", async () => {
    // success scenario: new Question() aur save() donon call hon
    let created: any;
    (Question as any).mockImplementation(() => {
      created = { save: jest.fn().mockResolvedValue(undefined) };
      return created;
    });

    const payload = {
      question_text: "What is 2+2?",
      question_type: "MCQ",
      options: ["3","4","5","6"],
      correct_answer: "4"
    };

    const res = await POST(
      makeReq(payload),
      makeCtx("507f1f77bcf86cd799439011")
    );

    // connect() check karo
    expect(dbConfig.connect).toHaveBeenCalled();
    // model constructor aur save() call hone chahiye
    expect(Question).toHaveBeenCalledWith({
      quiz_id: "507f1f77bcf86cd799439011",
      ...payload
    });
    expect(created.save).toHaveBeenCalled();

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      message: "Question added successfully"
    });
  });

  it("returns 500 on unexpected errors", async () => {
    // agar save throw kare, to 500 chahiye
    (Question as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("db crash"))
    }));

    const res = await POST(
      makeReq({
        question_text: "X",
        question_type: "MCQ",
        options: ["A","B"],
        correct_answer: "A"
      }),
      makeCtx("507f1f77bcf86cd799439011")
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
