import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    question_text: { type: String, required: true },
    question_type: { type: String, required: true },
    options: { type: [String], required: true },
    correct_answer: { type: String, required: true },
    points: { type: Number, required: true }, // ✅ Points for each question
  },
  {
    timestamps: true,
    strict: true, // ✅ This ensures extra fields (like 'timer') are not stored
  }
);

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;
