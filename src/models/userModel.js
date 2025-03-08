import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: [true, "Please provide a username"], unique: true },
    email: { type: String, required: [true, "Please provide an email"], unique: true },
    password: { type: String, required: [true, "Please provide a password"] },
    isVerified: { type: Boolean, default: false },
    total_points: { type: Number, default: 0 },
    badges: { 
      type: [
        {
          name: String,
          imageUrl: String,
          description: String,
          awardedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    hosted_quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  },
  { timestamps: true }
);

const UserNew = mongoose.models.UserNew || mongoose.model("UserNew", userSchema);
export default UserNew;
