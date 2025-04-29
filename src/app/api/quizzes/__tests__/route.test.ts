/**
 * @jest-environment node
 */
import 'openai/shims/node'; // in case you need Node shims
import { POST } from "../route";
import * as dbConfig from "@/dbConfig/dbConfig";
import Quiz from "@/models/quizModel";
import UserNew from "@/models/userModel";
import Question from "@/models/questionModel";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

jest.mock("@/dbConfig/dbConfig", () => ({ connect: jest.fn() }));
jest.mock("@/models/quizModel");
jest.mock("@/models/userModel");
jest.mock("@/models/questionModel");

describe("POST /api/quiz", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DB connect ko stub kar dia
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any): NextRequest {
    return { json: async () => body } as any;
  }

  it("returns 400 when title is missing", async () => {
    // agar title nahin diya, to 400 error
    const res = await POST(
      makeReq({ description: "Desc", created_by: "u1", duration: 5, questions: [] })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Quiz title is required" });
  });

  it("returns 400 when description is missing", async () => {
    const res = await POST(
      makeReq({ title: "T", created_by: "u1", duration: 5, questions: [] })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Quiz description is required" });
  });

  it("returns 400 when created_by is missing", async () => {
    const res = await POST(
      makeReq({ title: "T", description: "Desc", duration: 5, questions: [] })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Creator ID is required" });
  });

  it("returns 400 when duration is missing", async () => {
    const res = await POST(
      makeReq({ title: "T", description: "Desc", created_by: "u1", questions: [] })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Quiz duration is required" });
  });

  it("returns 201 and quiz on success", async () => {
    // 1) stub Quiz model
    let quizInst: any;
    (Quiz as any).mockImplementation(() => {
      quizInst = {
        _id: "quiz123",
        save: jest.fn().mockResolvedValue(undefined)
      };
      return quizInst;
    });

    // 2) stub user update and question insertion
    (UserNew.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
    (Question.insertMany as jest.Mock).mockResolvedValue([]);
    (Question.aggregate as jest.Mock).mockResolvedValue([{ total: 42 }]);

    // 3) fire handler
    const body = {
      title: "T",
      description: "Desc",
      created_by: "507f1f77bcf86cd799439011",
      duration: 5,
      questions: [
        { question_text: "Q", question_type: "MCQ", options: ["A","B"], correct_answer: "A", points: 10 }
      ]
    };
    const res = await POST(makeReq(body));

    // 4) assertions
    expect(dbConfig.connect).toHaveBeenCalled();
    expect(quizInst.save).toHaveBeenCalled();                          // quiz saved
    expect(UserNew.findByIdAndUpdate).toHaveBeenCalledWith(
      body.created_by,
      { $addToSet: { hosted_quizzes: quizInst._id } },
      { new: true }
    );
    expect(Question.insertMany).toHaveBeenCalled();                    // questions inserted
    expect(Question.aggregate).toHaveBeenCalled();                     // points aggregated

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.quiz._id).toBe("quiz123");                             // returned quiz ID
  });

  it("returns 400 on mongoose validation error", async () => {
    // simulate a ValidationError from mongoose
    const ve = new mongoose.Error.ValidationError();
    ve.errors = {
      title: new mongoose.Error.ValidatorError({ message: "Invalid title" })
    };

    (Quiz as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(ve)
    }));

    const res = await POST(
      makeReq({ title: "Bad", description: "D", created_by: "u1", duration: 5, questions: [] })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid title" });
  });

  it("returns 500 on unexpected error", async () => {
    (Quiz as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("db crash"))
    }));

    const res = await POST(
      makeReq({ title: "T", description: "D", created_by: "u1", duration: 5, questions: [] })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
