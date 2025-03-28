import mongoose from "mongoose";

const playerQuizSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserNew" },
  score: { type: Number, default: 0 },
  start_time: { type: Date, default: Date.now },
  completed_at: { type: Date },
  displayName: { type: String, default: "" },
  avatar: { type: String, default: "" },
}, { timestamps: true });

const PlayerQuizNew =
  mongoose.models.PlayerQuizNew || mongoose.model("PlayerQuizNew", playerQuizSchema);

export default PlayerQuizNew;