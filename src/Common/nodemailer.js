import nodemailer from "nodemailer";
import {
  NODEMAILER_PASS,
  NODEMAILER_USER,
} from "../../config/config.service.js";

export async function sendMail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Saraha App" <no-reply@saraha.com>`,
    to: email,
    subject: "Verify Your Email - Saraha",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#eef2f7;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header / Gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">Saraha</h1>
              <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Secure Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 30px;text-align:center;">

              <h2 style="margin:0 0 10px;color:#111827;font-size:20px;">
                Verify Your Email Address
              </h2>

              <p style="margin:0 0 25px;color:#6b7280;font-size:15px;line-height:1.6;">
                Use the verification code below to complete your sign up process.
                This code is temporary and will expire shortly.
              </p>

              <!-- OTP -->
              <div style="
                display:inline-block;
                background:#4f46e5;
                color:#ffffff;
                font-size:32px;
                font-weight:700;
                letter-spacing:8px;
                padding:18px 30px;
                border-radius:10px;
                box-shadow:0 6px 20px rgba(79,70,229,0.3);
                margin-bottom:25px;
              ">
                ${otp}
              </div>

              <p style="margin:0;color:#9ca3af;font-size:14px;">
                Expires in <strong style="color:#111827;">10 minutes</strong>
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 30px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
            </td>
          </tr>

          <!-- Extra Info Section -->
          <tr>
            <td style="padding:25px 30px;text-align:left;">

              <p style="margin:0 0 12px;color:#374151;font-size:14px;">
                If you didn’t request this code, you can safely ignore this email.
              </p>

              <p style="margin:0;color:#9ca3af;font-size:13px;">
                For security reasons, never share your verification code with anyone.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;">

              <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">
                © ${new Date().getFullYear()} Saraha App
              </p>

              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This is an automated message. Please do not reply.
              </p>

            </td>
          </tr>

        </table>

        <!-- Bottom spacing -->
        <table width="480">
          <tr><td style="height:20px;"></td></tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`,
  });
}
