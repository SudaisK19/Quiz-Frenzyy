
import mongoose from "mongoose";

const playerQuizSchema = new mongoose.Schema({
  session_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Session",
    index: true 
  },
  quiz_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Quiz",
    index: true 
  },
  player_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UserNew",
    index: true 
  },
  score: { 
    type: Number, 
    default: 0,
    index: true 
  },
  start_time: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  completed_at: { 
    type: Date,
    index: true 
  },
  displayName: { 
    type: String, 
    default: "",
    index: true 
  },
  avatar: { 
    type: String, 
    default: "",
    index: true 
  },
}, { 
  timestamps: true 
});

const PlayerQuizNew = mongoose.models.PlayerQuizNew || mongoose.model("PlayerQuizNew", playerQuizSchema);

export default PlayerQuizNew;
