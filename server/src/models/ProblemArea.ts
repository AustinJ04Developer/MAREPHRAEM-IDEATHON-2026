import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemArea extends Document {
  code: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  isOther: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemAreaSchema = new Schema<IProblemArea>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOther: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

ProblemAreaSchema.index({ isActive: 1 });

export const ProblemArea = mongoose.model<IProblemArea>('ProblemArea', ProblemAreaSchema);
