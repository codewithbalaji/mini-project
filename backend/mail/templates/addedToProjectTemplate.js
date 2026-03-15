const addedToProjectTemplate = ({ projectTitle, creatorName, projectLink }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Added to Project</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding:40px 32px 20px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;line-height:48px;background-color:#f0fdf4;color:#16a34a;border-radius:24px;margin-bottom:16px;font-size:24px;">🚀</div>
              <h1 style="margin:0;color:#0f172a;font-size:20px;font-weight:600;letter-spacing:-0.5px;">Welcome to the Project</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                <strong>${creatorName}</strong> has added you as a member to the project <strong>${projectTitle}</strong>.
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.6;">
                You can now view project details, participate in discussions, and collaborate on tasks.
              </p>

              <div style="text-align:center;margin:0 0 28px;">
                <a href="${projectLink}"
                   style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;padding:12px 28px;border-radius:6px;">
                  Go to Project
                </a>
              </div>
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

export default addedToProjectTemplate;
