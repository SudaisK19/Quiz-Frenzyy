import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema(
    {
      quiz_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Quiz", 
        required: true, 
        index: true 
      },
      join_code: { 
        type: String, 
        unique: true, 
        required: true, 
        default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
        index: true 
      },
      start_time: { 
        type: Date, 
        default: Date.now, 
        index: true 
      },
      end_time: { 
        type: Date, 
        index: true 
      },
      is_active: { 
        type: Boolean, 
        default: true, 
        index: true 
      },
      
    },
    { timestamps: true }
  );
  

// Optional: Compound index for createdAt and updatedAt if needed for queries
sessionSchema.index({ createdAt: 1, updatedAt: 1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
