import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeamMember {
  memberName: string;
  department: string;
  year?: string;
  registerNumber: string;
  section?: string;
  email?: string;
  phone?: string;
  isLeader?: boolean;
}

export interface IRegistration extends Document {
  projectId: string;
  categoryId: Types.ObjectId;
  categoryCodeSnapshot: string;
  categoryNameSnapshot: string;
  categoryAbbreviationSnapshot: string;
  otherProblemArea?: string | null;

  teamName: string;
  teamLeaderName: string;
  teamLeaderRegisterNumber: string;
  contactEmail?: string;
  department: string;
  section?: string;

  members: ITeamMember[];

  projectTitle: string;
  fieldVisitStatus: 'Yes' | 'No';

  supervisorName: string;
  supervisorDesignation: string;
  supervisorBranch: string;

  registrationStatus: 'Confirmed' | 'Archived';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    memberName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, trim: true, default: '' },
    registerNumber: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    isLeader: { type: Boolean, default: false },
  },
  { _id: false }
);

const RegistrationSchema = new Schema<IRegistration>(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProblemArea',
      required: true,
    },
    categoryCodeSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    categoryNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    categoryAbbreviationSnapshot: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    otherProblemArea: {
      type: String,
      trim: true,
      default: null,
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    teamLeaderName: {
      type: String,
      required: true,
      trim: true,
    },
    teamLeaderRegisterNumber: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },

    members: {
      type: [TeamMemberSchema],
      required: true,
      validate: [
        (val: ITeamMember[]) => val.length >= 1,
        'Team must have at least one member',
      ],
    },

    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fieldVisitStatus: {
      type: String,
      enum: ['Yes', 'No'],
      required: true,
    },

    supervisorName: {
      type: String,
      required: true,
      trim: true,
    },
    supervisorDesignation: {
      type: String,
      required: true,
      trim: true,
    },
    supervisorBranch: {
      type: String,
      required: true,
      trim: true,
    },

    registrationStatus: {
      type: String,
      enum: ['Confirmed', 'Archived'],
      default: 'Confirmed',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound and single indexes for search, filtering, and reporting
RegistrationSchema.index({ categoryId: 1 });
RegistrationSchema.index({ teamName: 1 });
RegistrationSchema.index({ department: 1 });
RegistrationSchema.index({ fieldVisitStatus: 1 });
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ deletedAt: 1 });

export const Registration = mongoose.model<IRegistration>(
  'Registration',
  RegistrationSchema
);
