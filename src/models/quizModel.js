import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true, // Index applied
    },
    description: {
      type: String,
      default: "",
      index: true, // Index applied
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserNew",
      required: true,
      index: true, // Index applied
    },
    duration: {
      type: Number,
      default: 10,
      index: true, // Index applied
    },
    total_points: {
      type: Number,
      default: 0,
      index: true, // Index applied
    },
  },
  { timestamps: true }
);

// Optional: Compound index on createdAt and updatedAt for queries involving timestamps.
quizSchema.index({ createdAt: 1, updatedAt: 1 });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
