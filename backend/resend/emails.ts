import {
  MAGIC_LINK_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../mailtrap/emailTemplates.ts";

import { resend, sender } from "./config.resend.ts";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (email: string, verficitionCode: string): Promise<void> => {
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
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending verfication email:", error);
    throw new Error(`Error sending verfication email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const recipients = email;
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: `Welcome ${name}`,
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendResetPasswordEmail = async (email: string, resetPasswordToken: string): Promise<void> => {
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
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetPasswordSuccessEmail = async (email: string): Promise<void> => {
  const recipients = email;
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: "Welcome again",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendMagicRequestEmail = async (email: string, magicToken: string): Promise<void> => {
  const recipients = email;
  try {
    const magicURL = `${process.env.CLIENT_URL}/api/login/magic-login?token=${magicToken}`;

    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject: "Magic Link Login",
      html: MAGIC_LINK_TEMPLATE.replace("{magicURL}", magicURL),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully", data);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};
