const otpTemplate = ({ name, otp }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 32px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;line-height:56px;background:rgba(255,255,255,0.15);border-radius:14px;margin-bottom:16px;font-size:28px;text-align:center;">🔐</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Verify your email</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Project Management System</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Hi <strong>${name}</strong>, welcome aboard! Use the code below to verify your email address and activate your account.
              </p>
              <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
                <p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Your verification code</p>
                <span style="display:inline-block;font-size:44px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:'Courier New',monospace;">${otp}</span>
              </div>
              <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;padding:12px 16px;margin:0 0 20px;">
                <p style="margin:0;color:#92400e;font-size:13px;">⏱ This code expires in <strong>30 minutes</strong>. Do not share it with anyone.</p>
              </div>
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                If you did not create an account, you can safely ignore this email.
              </p>
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

export default otpTemplate;
