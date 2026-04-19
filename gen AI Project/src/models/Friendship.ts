import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFriendship extends Document {
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate friend requests between the same two users
FriendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const Friendship: Model<IFriendship> = mongoose.models?.Friendship || mongoose.model<IFriendship>("Friendship", FriendshipSchema);
export default Friendship;
