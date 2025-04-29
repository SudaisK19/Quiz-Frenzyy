/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { PATCH } from "../route";
import { connect } from "@/dbConfig/dbConfig";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import { NextRequest } from "next/server";

jest.mock("@/dbConfig/dbConfig", () => ({ connect: jest.fn() }));
jest.mock("@/models/quizModel");
jest.mock("@/models/questionModel");

describe("PATCH /api/quiz/[quizid]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DB connect stub kia taake real DB na lage
    (connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any): NextRequest {
    return { json: async () => body } as any;
  }
  function makeCtx(id: string) {
    return { params: { quizid: id } } as any;
  }

  it("returns 404 when quiz not found", async () => {
    // jab aggregate chaley to 10 points wapas kare
    (Question.aggregate as jest.Mock).mockResolvedValue([{ total: 10 }]);
    // findByIdAndUpdate null wapas karey
    (Quiz.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const res = await PATCH(
      makeReq({ title: "T", description: "D", duration: 5, questions: [] }),
      makeCtx("507f1f77bcf86cd799439011")
    );

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Quiz not found" });
  });

  it("updates quiz and returns 200 without questions", async () => {
    // aggregate total points calculate kare
    (Question.aggregate as jest.Mock).mockResolvedValue([{ total: 15 }]);
    const updated = {
      _id: "quiz123",
      title: "T",
      description: "D",
      duration: 5,
      total_points: 15
    };
    // quiz update success
    (Quiz.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

    const body = { title: "New", description: "Desc", duration: 10, questions: [] };
    const res = await PATCH(makeReq(body), makeCtx("507f1f77bcf86cd799439011"));

    // ensure DB connect hua, aggregate ballaya, aur quiz update kia
    expect(connect).toHaveBeenCalled();
    expect(Question.aggregate).toHaveBeenCalledWith([
      { $match: { quiz_id: "507f1f77bcf86cd799439011" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]);
    expect(Quiz.findByIdAndUpdate).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      expect.objectContaining({
        title: "New", description: "Desc", duration: 10, total_points: 15
      }),
      { new: true }
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, quiz: updated });
  });

  it("updates associated questions when provided", async () => {
    // pehle points aggregate kare
    (Question.aggregate as jest.Mock).mockResolvedValue([{ total: 20 }]);
    const updated = {
      _id: "quiz123",
      title: "T",
      description: "D",
      duration: 5,
      total_points: 20
    };
    (Quiz.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
    // question updates ke liye stub
    (Question.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const qs = [
      {
        _id: "q1",
        question_text: "Q1",
        question_type: "MCQ",
        media_url: "u",
        options: ["A"],
        correct_answer: "A",
        correct_answers: [],
        hint: "h",
        points: 5
      },
      {
        _id: "q2",
        question_text: "Q2",
        question_type: "MCQ",
        options: ["B"],
        correct_answer: "B",
        points: 5
      }
    ];

    const res = await PATCH(
      makeReq({ title: "", description: "", duration: 5, questions: qs }),
      makeCtx("507f1f77bcf86cd799439011")
    );

    // dono questions ke liye update call honi chahiye
    expect(Question.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, quiz: updated });
  });

  it("returns 500 on unexpected errors", async () => {
    // agar aggregate hi throw kare
    (Question.aggregate as jest.Mock).mockRejectedValue(new Error("db fail"));

    const res = await PATCH(
      makeReq({ title: "", description: "", duration: 5, questions: [] }),
      makeCtx("507f1f77bcf86cd799439011")
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
