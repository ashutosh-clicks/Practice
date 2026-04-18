import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRevisionNotes extends Document {
  materialId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  sections: { heading: string; bullets: string[] }[];
  createdAt: Date;
  updatedAt: Date;
}

const RevisionNotesSchema = new Schema<IRevisionNotes>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    sections: [
      {
        heading: { type: String, required: true },
        bullets: [{ type: String, required: true }],
      }
    ]
  },
  { timestamps: true }
);

const RevisionNotes: Model<IRevisionNotes> = mongoose.models?.RevisionNotes || mongoose.model<IRevisionNotes>("RevisionNotes", RevisionNotesSchema);
export default RevisionNotes;
