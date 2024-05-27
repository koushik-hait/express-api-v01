import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "ABC Company",
      link: "https://rpsapi.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: options.from, // Updated to use options.from
    to: options.email,
    subject: options.subject, // Updated to use options.subject
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.log(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.log("Error: ", error);
  }
};

const sendEmailWithResend = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "ABC Company",
      link: "https://poc.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  try {
    const { data, error } = await resend.emails.send({
      from: options.from,
      to: [options.email], // Updated to use options.to instead of options.email
      subject: options.subject,
      text: emailTextual,
      html: emailHtml,
    });

    console.log("Resend email response:", data);
    console.log("Resend email error:", error);
  } catch (error) {
    console.log(
      "Email service failed silently. Make sure you have provided your RESEND credentials in the .env file"
    );
    console.log("Error: ", error);
  }
};

export { sendEmail, sendEmailWithResend };
