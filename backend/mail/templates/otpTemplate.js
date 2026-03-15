const otpTemplate = ({ name, otp }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verification Code</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding:40px 32px 20px;text-align:center;">
              <h1 style="margin:0;color:#0f172a;font-size:24px;font-weight:600;letter-spacing:-0.5px;">Verify your identity</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                Hi ${name},
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;">
                Please use the following verification code to complete your registration. This code is valid for 30 minutes.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <div style="display:inline-block;background-color:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:700;letter-spacing:4px;padding:16px 32px;border-radius:8px;">
                  ${otp}
                </div>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;text-align:center;">
                If you did not request this code, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} Project Management System.</p>
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
