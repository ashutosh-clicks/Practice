import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuiz extends Document {
  materialId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
      }
    ]
  },
  { timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.models?.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
