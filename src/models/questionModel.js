import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    question_text: { type: String, required: true },
    question_type: {
      type: String,
      required: true,
      enum: ["MCQ", "Short Answer", "Image", "Ranking"],
    },
    media_url: { type: String }, 
    options: { type: [String], required: true },
    
    correct_answer: { type: mongoose.Schema.Types.Mixed, required: true },
    hint: { type: String },
    points: { type: Number, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const QuestionNews =
  mongoose.models.QuestionNews || mongoose.model("QuestionNews", questionSchema);
export default QuestionNews;
