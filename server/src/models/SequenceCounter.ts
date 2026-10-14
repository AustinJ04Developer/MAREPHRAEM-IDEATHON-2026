import mongoose, { Schema, Document } from 'mongoose';

export interface ISequenceCounter extends Document {
  scope: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const SequenceCounterSchema = new Schema<ISequenceCounter>(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const SequenceCounter = mongoose.model<ISequenceCounter>(
  'SequenceCounter',
  SequenceCounterSchema
);
