import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true, // Index applied
      index: true, // Index applied
    },
    question_text: {
      type: String,
      required: true,
      index: true, // Index applied
    },
    question_type: {
      type: String,
      required: true,
      enum: ["MCQ", "Short Answer", "Image", "Ranking"],
      index: true, // Index applied
    },
    media_url: {
      type: String,
      index: true, // Index applied
    },
    options: {
      type: [String],
      required: true,
      index: true, // Index applied (creates a multikey index)
    },
    correct_answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
     
    },
    hint: {
      type: String,
      index: true, // Index applied
    },
    points: {
      type: Number,
      required: true,
      index: true, // Index applied
    },
    question_text: {
      type: String,
      required: true,
      index: true, // Index applied
    },
    question_type: {
      type: String,
      required: true,
      enum: ["MCQ", "Short Answer", "Image", "Ranking"],
      index: true, // Index applied
    },
    media_url: {
      type: String,
      index: true, // Index applied
    },
    options: {
      type: [String],
      required: true,
      index: true, // Index applied (creates a multikey index)
    },
    correct_answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
     
    },
    hint: {
      type: String,
      index: true, // Index applied
    },
    points: {
      type: Number,
      required: true,
      index: true, // Index applied
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Optional: Add compound index on timestamps if you frequently query based on them.
questionSchema.index({ createdAt: 1, updatedAt: 1 });

const QuestionNews =
  mongoose.models.QuestionNews || mongoose.model("QuestionNews", questionSchema);

export default QuestionNews;