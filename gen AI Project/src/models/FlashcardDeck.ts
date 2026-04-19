import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFlashcardDeck extends Document {
  materialId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sharedWith?: mongoose.Types.ObjectId[];
  title: string;
  cards: { front: string; back: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardDeckSchema = new Schema<IFlashcardDeck>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    title: { type: String, required: true },
    cards: [
      {
        front: { type: String, required: true },
        back: { type: String, required: true },
      }
    ]
  },
  { timestamps: true }
);

const FlashcardDeck: Model<IFlashcardDeck> = mongoose.models?.FlashcardDeck || mongoose.model<IFlashcardDeck>("FlashcardDeck", FlashcardDeckSchema);
export default FlashcardDeck;
