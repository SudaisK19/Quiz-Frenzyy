import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  player_quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerQuiz", required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  submitted_answer: { type: String, required: true },
  is_correct: { type: Boolean, required: true },
  points: { type: Number, required: true },
}, { timestamps: true });

const Answer = mongoose.models.Answer || mongoose.model("Answer", answerSchema);
export default Answer;
