const nodemailer = require('nodemailer');

// ─── Shared Government Inbox ─────────────────────────────────────────────────
// All department complaints are routed to this single shared government email.
const GOVT_INBOX = 'smartcivic17@gmail.com';

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a complaint-notification email to the relevant government department.
 *
 * @param {Object} complaint - Saved Mongoose complaint document
 * @returns {Promise<boolean>} true on success, false on failure
 */
const sendComplaintEmail = async (complaint) => {
  const { name, phone, address, department, service, complaintText, _id } = complaint;

  const recipientEmail = GOVT_INBOX;

  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.warn('⚠️  [EmailService] EMAIL or EMAIL_PASS not configured in .env. Skipping email.');
    return false;
  }

  const mailOptions = {
    from: `"Smart Civic Kiosk" <${process.env.EMAIL}>`,
    to:   recipientEmail,
    subject: `New Complaint Registered — ${department}`,
    text: `
A new complaint has been registered.

ID: ${_id}
Name: ${name}
Phone: ${phone}
Address: ${address}
Department: ${department}
Service: ${service || 'General'}
Complaint: ${complaintText}

— Smart Civic System
    `.trim(),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1a3a6e;">🏛️ Smart Civic Utility Kiosk</h2>
        <p><strong>New Complaint Registered</strong></p>
        <hr/>
        <table style="width: 100%;">
          <tr><td><strong>ID:</strong></td><td>${_id}</td></tr>
          <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
          <tr><td><strong>Department:</strong></td><td>${department}</td></tr>
          <tr><td><strong>Service:</strong></td><td>${service || 'General'}</td></tr>
        </table>
        <p><strong>Complaint:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${complaintText}</div>
      </div>
    `,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Email sent to ${recipientEmail} (Dept: ${department})`);
    return true;
  } catch (error) {
    console.error(`❌ [EmailService] Failed to send email: ${error.message}`);
    // Returning false so the caller knows the email failed, but doesn't crash the API.
    return false;
  }
};

module.exports = { sendComplaintEmail, GOVT_INBOX };
