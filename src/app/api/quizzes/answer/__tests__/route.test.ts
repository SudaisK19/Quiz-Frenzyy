/**
 * @jest-environment node
 */
import 'openai/shims/node';
import { POST } from "../route";
import * as dbConfig from "@/dbConfig/dbConfig";
import Answer from "@/models/answerModel";
import Question from "@/models/questionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import { NextRequest } from "next/server";

jest.mock("@/dbConfig/dbConfig", () => ({ connect: jest.fn() }));
jest.mock("@/models/answerModel");
jest.mock("@/models/questionModel");
jest.mock("@/models/playerQuizModel");

describe("POST /api/answer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DB connect ko stub kar rahe hain taake real DB request na ho
    (dbConfig.connect as jest.Mock).mockResolvedValue(undefined);
  });

  function makeReq(body: any): NextRequest {
    return { json: async () => body } as any;
  }

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing required fields" });
  });

  it("returns 404 when question is not found", async () => {
    // Question.findById null wapas kare
    (Question.findById as unknown as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({
      player_quiz_id: "pq1",
      question_id: "q1",
      submitted_answer: "foo"
    }));

    expect(dbConfig.connect).toHaveBeenCalled();
    expect((Question.findById as jest.Mock)).toHaveBeenCalledWith("q1");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Question not found" });
  });

  it("returns 201 and awards points when answer is correct", async () => {
    // ek simple MCQ question stub karte hain
    (Question.findById as unknown as jest.Mock).mockResolvedValue({
      question_type: "MCQ",
      correct_answer: "Yes",
      points: 7
    });

    // stub new Answer() aur save()
    let answerInst: any;
    ;(Answer as unknown as jest.Mock).mockImplementation(() => {
      answerInst = { save: jest.fn().mockResolvedValue(undefined) };
      return answerInst;
    });

    // aggregate se total score calculate hoga
    ;(Answer.aggregate as unknown as jest.Mock).mockResolvedValue([{ total: 7 }]);
    // PlayerQuiz score update stub
    (PlayerQuiz.findByIdAndUpdate as unknown as jest.Mock).mockResolvedValue({});

    const res = await POST(makeReq({
      player_quiz_id: "pq1",
      question_id: "q1",
      submitted_answer: "yes"  // case-insensitive match
    }));

    expect((Question.findById as jest.Mock)).toHaveBeenCalledWith("q1");
    expect(answerInst.save).toHaveBeenCalled();
    expect((Answer.aggregate as jest.Mock)).toHaveBeenCalledWith([
      { $match: { player_quiz_id: "pq1" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]);
    expect((PlayerQuiz.findByIdAndUpdate as jest.Mock)).toHaveBeenCalledWith("pq1", {
      $set: { score: 7 }
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      is_correct: true,
      pointsEarned: 7
    });
  });

  it("returns 201 and awards zero points when answer is incorrect", async () => {
    // incorrect scenario stub
    (Question.findById as unknown as jest.Mock).mockResolvedValue({
      question_type: "MCQ",
      correct_answer: "True",
      points: 5
    });

    let answerInst: any;
    ;(Answer as unknown as jest.Mock).mockImplementation(() => {
      answerInst = { save: jest.fn().mockResolvedValue(undefined) };
      return answerInst;
    });

    ;(Answer.aggregate as unknown as jest.Mock).mockResolvedValue([{ total: 0 }]);
    (PlayerQuiz.findByIdAndUpdate as unknown as jest.Mock).mockResolvedValue({});

    const res = await POST(makeReq({
      player_quiz_id: "pq2",
      question_id: "q2",
      submitted_answer: "false"
    }));

    expect(answerInst.save).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      is_correct: false,
      pointsEarned: 0
    });
  });

  it("returns 500 on unexpected errors", async () => {
    // agar Question.findById throw kare
    (Question.findById as unknown as jest.Mock).mockImplementation(() => {
      throw new Error("db crash");
    });

    const res = await POST(makeReq({
      player_quiz_id: "pq3",
      question_id: "q3",
      submitted_answer: "anything"
    }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
