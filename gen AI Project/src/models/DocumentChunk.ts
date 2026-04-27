import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentChunk extends Document {
  materialId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chunkIndex: number;
  content: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

// Index for efficient lookups by material
DocumentChunkSchema.index({ materialId: 1, chunkIndex: 1 });
// Index for user-scoped queries
DocumentChunkSchema.index({ userId: 1 });

const DocumentChunk: Model<IDocumentChunk> =
  mongoose.models?.DocumentChunk ||
  mongoose.model<IDocumentChunk>("DocumentChunk", DocumentChunkSchema);

export default DocumentChunk;
