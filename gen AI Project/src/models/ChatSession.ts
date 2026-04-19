import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  sharedWith?: mongoose.Types.ObjectId[];
  materialId: string; // Can be a specific ID or "all"
  title: string;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    materialId: { type: String, required: true },
    title: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      }
    ]
  },
  { timestamps: true }
);

const ChatSession: Model<IChatSession> = mongoose.models?.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
export default ChatSession;
