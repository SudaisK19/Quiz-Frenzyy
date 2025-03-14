import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema({
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    join_code: { 
        type: String, 
        unique: true, 
        required: true, 
        default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
    }, 
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
