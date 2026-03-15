const taskOverdueTemplate = ({ taskTitle, projectName, dueDate, daysOverdue, taskLink }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Task Overdue</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding:40px 32px 20px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;line-height:48px;background-color:#fee2e2;color:#ef4444;border-radius:24px;margin-bottom:16px;font-size:24px;">🚨</div>
              <h1 style="margin:0;color:#0f172a;font-size:20px;font-weight:600;letter-spacing:-0.5px;">Task Overdue</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                A task in the <strong>${projectName}</strong> project is currently <strong>${daysOverdue} days overdue</strong>.
              </p>
              
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #ef4444;border-radius:6px;padding:16px;margin:0 0 24px;">
                <p style="margin:0 0 8px;color:#0f172a;font-size:16px;font-weight:600;">${taskTitle}</p>
                <p style="margin:0;color:#475569;font-size:14px;"><strong>Was Due:</strong> ${dueDate}</p>
              </div>

              <div style="text-align:center;margin:0 0 28px;">
                <a href="${taskLink}"
                   style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;padding:12px 28px;border-radius:6px;">
                  View Task
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

export default taskOverdueTemplate;
