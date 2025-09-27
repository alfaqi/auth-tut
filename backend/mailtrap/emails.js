import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (email, verficitionCode) => {
  const recipients = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
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

export const sendWelcomeEmail = async (email, name) => {
  const recipients = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      template_uuid: process.env.MAILTRAP_TEMPLATE_UUID,
      template_variables: {
        company_info_name: "AUTH APP",
        name: name,
      },
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendResetPasswordEmail = async (email, resetPasswordToken) => {
  const recipients = [{ email }];
  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};
