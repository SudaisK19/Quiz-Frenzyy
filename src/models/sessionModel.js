import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema(
  {
    quiz_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Quiz", 
      required: true, 
      index: true // Index applied for faster lookups
    },
    join_code: { 
      type: String, 
      unique: true, 
      required: true, 
      default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
      index: true // Explicitly setting index (unique automatically indexes as well)
    },
    start_time: { 
      type: Date, 
      default: Date.now, 
      index: true // Index applied
    },
    end_time: { 
      type: Date, 
      index: true // Index applied
    },
    is_active: { 
      type: Boolean, 
      default: true, 
      index: true // Index applied
    }
  },
  { timestamps: true }
);

// Optional: Compound index for createdAt and updatedAt if needed for queries
sessionSchema.index({ createdAt: 1, updatedAt: 1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
