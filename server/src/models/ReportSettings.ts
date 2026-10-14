import mongoose, { Schema, Document } from 'mongoose';

export interface IReportSettings extends Document {
  organizationName: string;
  eventName: string;
  collegeName: string;
  departmentName: string;
  reportTitle: string;
  reportSubtitle: string;
  address: string;
  contactInformation: string;
  footerText: string;

  headerImageKey?: string | null;
  headerImageMimeType?: string | null;
  headerImageWidth?: number | null;
  headerImageHeight?: number | null;

  headerAlignment: 'left' | 'center' | 'right';
  imageFit: 'contain' | 'cover';
  maximumImageWidth: number;
  maximumImageHeight: number;

  showReportTitle: boolean;
  showGeneratedDate: boolean;
  showPageNumbers: boolean;
  showFooter: boolean;

  updatedBy?: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSettingsSchema = new Schema<IReportSettings>(
  {
    organizationName: {
      type: String,
      default: 'Mar Ephraem College of Engineering & Technology',
      trim: true,
    },
    eventName: {
      type: String,
      default: 'Marephraem Ideasource - Ideathon 2026',
      trim: true,
    },
    collegeName: {
      type: String,
      default: 'Mar Ephraem College of Engineering and Technology',
      trim: true,
    },
    departmentName: {
      type: String,
      default: 'Innovation and Entrepreneurship Development Cell (IEDC)',
      trim: true,
    },
    reportTitle: {
      type: String,
      default: 'Consolidated Project Registration Register',
      trim: true,
    },
    reportSubtitle: {
      type: String,
      default: 'Official Team Verification & Problem Area Index',
      trim: true,
    },
    address: {
      type: String,
      default: 'Malankara Hills, Elavuvilai, Marthandam, Kanyakumari District, Tamil Nadu - 629171',
      trim: true,
    },
    contactInformation: {
      type: String,
      default: 'Email: ideathon@marephraem.edu.in | Web: www.marephraem.edu.in',
      trim: true,
    },
    footerText: {
      type: String,
      default: 'Marephraem Ideasource 2026 • Official Registration Management System • Confidential Institutional Document',
      trim: true,
    },

    headerImageKey: {
      type: String,
      default: null,
    },
    headerImageMimeType: {
      type: String,
      default: null,
    },
    headerImageWidth: {
      type: Number,
      default: null,
    },
    headerImageHeight: {
      type: Number,
      default: null,
    },

    headerAlignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center',
    },
    imageFit: {
      type: String,
      enum: ['contain', 'cover'],
      default: 'contain',
    },
    maximumImageWidth: {
      type: Number,
      default: 680,
    },
    maximumImageHeight: {
      type: Number,
      default: 130,
    },

    showReportTitle: {
      type: Boolean,
      default: true,
    },
    showGeneratedDate: {
      type: Boolean,
      default: true,
    },
    showPageNumbers: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Administrator',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ReportSettings = mongoose.model<IReportSettings>(
  'ReportSettings',
  ReportSettingsSchema
);
