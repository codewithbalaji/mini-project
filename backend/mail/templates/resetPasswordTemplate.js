const resetPasswordTemplate = ({ name, resetLink }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px 32px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;line-height:56px;background:rgba(255,255,255,0.1);border-radius:14px;margin-bottom:16px;font-size:28px;text-align:center;">🔑</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Reset your password</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">Project Management System</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Hi <strong>${name}</strong>, we received a request to reset your password. Click the button below to choose a new one.
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${resetLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  Reset Password
                </a>
              </div>
              <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:12px 16px;margin:0 0 20px;">
                <p style="margin:0;color:#991b1b;font-size:13px;">⏱ This link expires in <strong>1 hour</strong>. Request a new link if it expires.</p>
              </div>
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">If the button doesn't work, paste this link into your browser:</p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${resetLink}" style="color:#4f46e5;font-size:12px;">${resetLink}</a>
              </p>
              <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:6px;padding:12px 16px;">
                <p style="margin:0;color:#14532d;font-size:13px;">🔒 If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Project Management System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export default resetPasswordTemplate;
