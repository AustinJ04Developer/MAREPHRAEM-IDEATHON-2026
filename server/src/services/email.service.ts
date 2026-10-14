import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { IRegistration } from '../models/Registration.js';
import { generateIndividualRegistrationPdf } from './pdf.service.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!transporter && env.SMTP_USER && env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } catch (err) {
      console.warn('[Email] Could not initialize nodemailer transporter:', err);
    }
  }
  return transporter;
}

export async function sendRegistrationConfirmationEmail(
  registration: IRegistration,
  recipientEmail: string
): Promise<{ sent: boolean; reason?: string }> {
  if (!recipientEmail || !recipientEmail.trim()) {
    return { sent: false, reason: 'No recipient email provided' };
  }

  const cleanRecipient = recipientEmail.trim();

  // If email notifications are disabled or credentials not set, log and return gracefully
  if (!env.ENABLE_EMAIL_NOTIFICATIONS || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log(
      `[Email] Registration confirmation notification queued for ${cleanRecipient} (Project ID: ${registration.projectId}). (Live SMTP disabled via ENABLE_EMAIL_NOTIFICATIONS=false)`
    );
    return {
      sent: true,
      reason: 'Notification logged (Live SMTP not configured or disabled in .env)',
    };
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    return { sent: false, reason: 'Transporter unavailable' };
  }

  const membersHtml = (registration.members || [])
    .map(
      (m, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 8px 12px; font-weight: bold; color: #475569;">#${idx + 1}</td>
        <td style="padding: 8px 12px; font-weight: 600; color: #0f172a;">${m.memberName} ${m.isLeader ? '<span style="background: #4f46e5; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Leader</span>' : ''}</td>
        <td style="padding: 8px 12px; font-family: monospace; color: #334155;">${m.registerNumber}</td>
        <td style="padding: 8px 12px; color: #475569;">${m.year ? `${m.year}, ` : ''}${m.department} (${m.section})</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Registration Confirmed - Marephraem Ideasource 2026</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
                  <div style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">
                    Mar Ephraem College of Engineering & Technology
                  </div>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                    Marephraem Ideasource
                  </h1>
                  <div style="font-size: 12px; font-weight: 700; color: #fdba74; margin-top: 4px; letter-spacing: 0.5px;">
                    Ideathon 2026 • Innovation & Incubation
                  </div>
                  <div style="display: inline-block; margin-top: 15px; background: rgba(255,255,255,0.15); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #e0e7ff;">
                    Official Registration Confirmation
                  </div>
                </td>
              </tr>

              <!-- Project ID Highlight -->
              <tr>
                <td style="padding: 30px; text-align: center; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
                    Your Authoritative Project ID
                  </div>
                  <div style="font-family: 'Courier New', monospace; font-size: 38px; font-weight: 900; color: #4338ca; letter-spacing: 2px;">
                    ${registration.projectId}
                  </div>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #475569;">
                    Preserve this Project ID for all upcoming event stages, mentor evaluations, and correspondence.
                  </p>
                </td>
              </tr>

              <!-- Details Section -->
              <tr>
                <td style="padding: 30px;">
                  <h3 style="margin: 0 0 15px; font-size: 16px; color: #0f172a; font-weight: 800; border-bottom: 2px solid #4f46e5; padding-bottom: 6px; display: inline-block;">
                    Project & Team Information
                  </h3>

                  <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; margin-bottom: 25px;">
                    <tr>
                      <td width="35%" style="color: #64748b; font-weight: 600;">Project Title:</td>
                      <td style="color: #0f172a; font-weight: 700;">${registration.projectTitle}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Problem Area:</td>
                      <td style="color: #0f172a;">${registration.categoryNameSnapshot} ${registration.otherProblemArea ? `("${registration.otherProblemArea}")` : ''}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Team Name:</td>
                      <td style="color: #0f172a; font-weight: 700;">${registration.teamName}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Team Leader:</td>
                      <td style="color: #0f172a;">${registration.teamLeaderName} (${registration.teamLeaderRegisterNumber})</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Department & Section:</td>
                      <td style="color: #0f172a;">${registration.department}${registration.section ? ` - Section ${registration.section}` : ''}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Field Visit Conducted:</td>
                      <td style="color: #0f172a; font-weight: bold;">${registration.fieldVisitStatus}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Faculty Supervisor:</td>
                      <td style="color: #0f172a;">${registration.supervisorName} (${registration.supervisorDesignation}, ${registration.supervisorBranch})</td>
                    </tr>
                  </table>

                  <!-- Members Table -->
                  <h3 style="margin: 0 0 12px; font-size: 14px; color: #0f172a; font-weight: 800;">
                    Registered Team Members (${registration.members?.length || 1})
                  </h3>

                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
                    <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase;">
                      <th style="padding: 8px 12px;">#</th>
                      <th style="padding: 8px 12px;">Member Name</th>
                      <th style="padding: 8px 12px;">Register No</th>
                      <th style="padding: 8px 12px;">Year & Dept</th>
                    </tr>
                    ${membersHtml}
                  </table>

                  <!-- Instructions -->
                  <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 15px; border-radius: 6px; font-size: 12px; color: #312e81; line-height: 1.5;">
                    <strong>Next Steps:</strong>
                    <ul style="margin: 6px 0 0; padding-left: 18px;">
                      <li>The official registration confirmation slip is attached to this email as a PDF.</li>
                      <li>Consult with your designated faculty supervisor for mentorship and prototype refinement.</li>
                      <li>Review problem-area guidelines as published by the IEDC secretariat.</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0f172a; color: #94a3b8; padding: 25px; text-align: center; font-size: 11px; line-height: 1.6;">
                  <strong style="color: #ffffff;">Marephraem Ideasource 2026</strong><br />
                  Innovation and Entrepreneurship Development Cell (IEDC)<br />
                  Mar Ephraem College of Engineering & Technology, Malankara Hills, Elavuvilai - 629171<br />
                  Email: ideathon@marephraem.edu.in | Web: www.marephraem.edu.in
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const fromAddress = env.SMTP_FROM.includes('<')
      ? env.SMTP_FROM
      : `"${env.SMTP_FROM.replace(/"/g, '')}" <${env.SMTP_USER}>`;

    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    try {
      const pdfBuffer = await generateIndividualRegistrationPdf(registration);
      if (pdfBuffer && pdfBuffer.length > 0) {
        attachments.push({
          filename: `${registration.projectId}-Registration-Slip.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      }
    } catch (pdfErr) {
      console.warn('[Email] Could not attach PDF slip to email:', pdfErr);
    }

    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to: cleanRecipient,
      subject: `[Marephraem Ideasource 2026] Registration Confirmed - Project ID: ${registration.projectId}`,
      html: htmlContent,
      attachments,
    });
    console.log(`[Email] Confirmation email sent successfully to ${cleanRecipient} (Message ID: ${info.messageId})`);
    return { sent: true };
  } catch (error: any) {
    console.error(`[Email] Error sending email to ${cleanRecipient}:`, error);
    return { sent: false, reason: error.message };
  }
}
