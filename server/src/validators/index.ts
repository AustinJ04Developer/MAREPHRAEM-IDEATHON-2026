import { z } from 'zod';

export const teamMemberSchema = z.object({
  memberName: z.string().trim().min(2, 'Member name must be at least 2 characters').max(100),
  department: z.string().trim().min(2, 'Department is required').max(100),
  year: z.string().trim().max(50).optional().or(z.literal('')),
  registerNumber: z.string().trim().min(2, 'Register number is required').max(50),
  section: z.string().trim().max(50).optional().or(z.literal('')),
  email: z.string().trim().email('Valid email address is required').max(150).optional().or(z.literal('')),
  phone: z.string().trim().min(5, 'Valid phone number is required').max(25).optional().or(z.literal('')),
  isLeader: z.boolean().optional(),
});

export const registrationInputSchema = z
  .object({
    teamName: z.string().trim().min(2, 'Team name must be at least 2 characters').max(100),
    contactEmail: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
    department: z.string().trim().min(2, 'Department is required').max(100),
    section: z.string().trim().max(50).optional().or(z.literal('')),
    teamLeaderIndex: z.number().int().min(0, 'Please select a team leader'),
    members: z
      .array(teamMemberSchema)
      .min(1, 'At least 1 team member is required')
      .max(10, 'A team cannot have more than 10 members')
      .refine(
        (members) => {
          const regNumbers = members.map((m) => m.registerNumber.toUpperCase().trim());
          return new Set(regNumbers).size === regNumbers.length;
        },
        { message: 'Team members must have unique register numbers within the team' }
      ),
    projectTitle: z.string().trim().min(3, 'Project title must be at least 3 characters').max(200),
    categoryId: z.string().trim().min(1, 'Problem area is required'),
    otherProblemArea: z.string().trim().max(150).optional().nullable(),
    fieldVisitStatus: z.enum(['Yes', 'No'], {
      errorMap: () => ({ message: 'Field visit status must be either Yes or No' }),
    }),
    supervisorName: z.string().trim().min(2, 'Supervisor name is required').max(100),
    supervisorDesignation: z.string().trim().min(2, 'Designation is required').max(100),
    supervisorBranch: z.string().trim().min(2, 'Branch is required').max(100),
  })
  .refine(
    (data) => {
      // Validate that teamLeaderIndex points to an existing member
      return data.teamLeaderIndex >= 0 && data.teamLeaderIndex < data.members.length;
    },
    {
      message: 'Invalid team leader selection',
      path: ['teamLeaderIndex'],
    }
  );

export const registrationUpdateSchema = z.object({
  teamName: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(2).max(100).optional(),
  section: z.string().trim().min(1).max(50).optional(),
  projectTitle: z.string().trim().min(3).max(200).optional(),
  otherProblemArea: z.string().trim().max(150).optional().nullable(),
  fieldVisitStatus: z.enum(['Yes', 'No']).optional(),
  supervisorName: z.string().trim().min(2).max(100).optional(),
  supervisorDesignation: z.string().trim().min(2).max(100).optional(),
  supervisorBranch: z.string().trim().min(2).max(100).optional(),
  members: z.array(teamMemberSchema).min(1).max(10).optional(),
  teamLeaderIndex: z.number().int().min(0).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const reportSettingsSchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  eventName: z.string().trim().min(2).max(200),
  collegeName: z.string().trim().min(2).max(200),
  departmentName: z.string().trim().min(2).max(200),
  reportTitle: z.string().trim().min(2).max(200),
  reportSubtitle: z.string().trim().min(2).max(200),
  address: z.string().trim().max(300),
  contactInformation: z.string().trim().max(300),
  footerText: z.string().trim().max(300),
  headerAlignment: z.enum(['left', 'center', 'right']),
  imageFit: z.enum(['contain', 'cover']),
  maximumImageWidth: z.coerce.number().min(100).max(1200),
  maximumImageHeight: z.coerce.number().min(30).max(400),
  showReportTitle: z.boolean(),
  showGeneratedDate: z.boolean(),
  showPageNumbers: z.boolean(),
  showFooter: z.boolean(),
});
