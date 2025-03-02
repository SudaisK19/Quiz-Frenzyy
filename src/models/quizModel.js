import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    duration: { type: Number, default: 10 },
    total_points: { type: Number, default: 0 }, // Keep track of sum of all question points
    // ... other fields if needed
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
