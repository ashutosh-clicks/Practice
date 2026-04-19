import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterial extends Document {
  title: string;
  originalFileName: string;
  content: string; 
  fileUrl: string;
  userId: mongoose.Types.ObjectId;
  sharedWith?: mongoose.Types.ObjectId[];
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true },
    originalFileName: { type: String, required: true },
    content: { type: String, required: true }, // Extracted parsed text
    fileUrl: { type: String, required: true }, // Path to the temporarily saved local file
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    fileType: { type: String, default: 'application/pdf' },
  },
  { timestamps: true }
);

const Material: Model<IMaterial> = mongoose.models?.Material || mongoose.model<IMaterial>("Material", MaterialSchema);
export default Material;
