const inviteTemplate = ({ inviteLink, organizationName, role = "EMPLOYEE" }) => {
  const roleDisplay = role.charAt(0) + role.slice(1).toLowerCase();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're Invited</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding:40px 32px 20px;text-align:center;">
              <h1 style="margin:0;color:#0f172a;font-size:24px;font-weight:600;letter-spacing:-0.5px;">Invitation to Join</h1>
              <p style="margin:8px 0 0;color:#475569;font-size:15px;">${organizationName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                You've been invited to join <strong>${organizationName}</strong> on the Project Management System as a <strong>${roleDisplay}</strong>.
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.6;">
                Click the button below to accept your invitation and set up your account.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${inviteLink}"
                   style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none;padding:12px 32px;border-radius:6px;">
                  Accept Invitation
                </a>
              </div>
              <div style="background-color:#f1f5f9;border-radius:6px;padding:16px;margin:0 0 20px;text-align:center;">
                <p style="margin:0;color:#475569;font-size:13px;">This invitation will expire in <strong>48 hours</strong>.</p>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;text-align:center;">
                If you were not expecting this invitation, you can safely ignore this email.
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

export default inviteTemplate;