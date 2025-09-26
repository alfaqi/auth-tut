import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verficitionCode) => {
  const recipients = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Verify your email",
      html: "<h1>Your verification code is: {verificationCode}</h1>".replace(
        "{verificationCode}",
        verficitionCode
      ),
      category: "Email Verfication",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verfication email:", error);
    throw new Error(`Error sending verfication email: ${error}`);
  }
};
