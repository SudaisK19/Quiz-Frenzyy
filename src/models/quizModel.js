import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "UserNew", required: true },
    duration: { type: Number, default: 10 },
    total_points: { type: Number, default: 0 },
    
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
