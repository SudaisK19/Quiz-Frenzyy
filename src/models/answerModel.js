import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    player_quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerQuizNews",
      required: true,
    },
    question_id:

    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionNews",
      required: true,
    },
    submitted_answer: { type: mongoose.Schema.Types.Mixed, required: true },
    is_correct: { type: Boolean, required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

const AnswerNew = mongoose.models.AnswerNew || mongoose.model("AnswerNew", answerSchema);
export default AnswerNew;
