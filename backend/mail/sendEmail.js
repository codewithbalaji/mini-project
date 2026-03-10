import transporter from "./transporter.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Project System" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Email sending failed");
  }
};