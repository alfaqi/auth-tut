import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../mailtrap/emailTemplates.js";

import { resend, sender } from "./config.resend.js";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (email, verficitionCode) => {
  const recipients = email;
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verficitionCode
      ),
    });

    if (error) {
      throw new Error(error);
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending verfication email:", error);
    throw new Error(`Error sending verfication email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipients = email;
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: `Welcome ${name}`,
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    });

    if (error) {
      throw new Error(error);
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendResetPasswordEmail = async (email, resetPasswordToken) => {
  const recipients = email;
  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;

    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    if (error) {
      throw new Error(error);
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetPasswordSuccessEmail = async (email) => {
  const recipients = email;
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: "Welcome again",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    if (error) {
      throw new Error(error);
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};
