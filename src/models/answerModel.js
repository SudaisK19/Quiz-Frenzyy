
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    player_quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerQuizNew",
      required: true,
      index: true, // Create an index for faster lookups
    },
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionNews",
      required: true,
      index: true, // Index applied
    },
    submitted_answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      
    },
    is_correct: {
      type: Boolean,
      required: true,
      index: true, // Index applied
    },
    points: {
      type: Number,
      required: true,
      index: true, // Index applied
    },
  },
  { timestamps: true } // Mongoose automatically indexes _id; you can also define compound indexes on timestamps if needed.
);

// Optional: If you query heavily on the timestamps, you can add compound indexes as well
answerSchema.index({ createdAt: 1, updatedAt: 1 });

const AnswerNew = mongoose.models.AnswerNew || mongoose.model("AnswerNew", answerSchema);
export default AnswerNew;
