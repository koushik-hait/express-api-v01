import { Contact } from "../../models/portfolio-cms/contact.models.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import { sendEmailWithMailerSend } from "../../utils/mailer.js";

export const saveContact = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    const contact_type = "email";
    if (!name || !email || !mobile || !message) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }
    const newContact = await Contact.create({
      name,
      email,
      mobile,
      message,
    });
    if (!newContact) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Something went wrong"));
    }

    await sendEmailWithMailerSend({
      email: "koushikhait49@koushikhait.site",
      from: process.env.MAILER_FROM,
      fromName: process.env.MAILER_FROM_NAME,
      to: newContact?.email,
      subject: `Hello ${newContact?.name}, Wellcome to ABC Company`,
      link: `https://koushikhait.site`,
      mailgenContent: {
        subject: "ABC Company",
        body: {
          name: newContact?.name,
          intro:
            "Thank you for reaching out to us. We will get back to you soon.",
          action: {
            instructions: "Click the button below to Check my Portfolio",
            button: {
              color: "#DC4D2F",
              text: "Check My Portfolio",
              link: `https://koushikhait.site`,
            },
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newContact, "Contact created successfully"));
  } catch (error) {
    // console.log(error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
