import mongoose from "mongoose";

const playerQuizSchema = new mongoose.Schema({
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0 },
    completed_at: { type: Date }
}, { timestamps: true });

const PlayerQuiz = mongoose.models.PlayerQuiz || mongoose.model("PlayerQuiz", playerQuizSchema);
export default PlayerQuiz;
