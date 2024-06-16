import { Contact } from "../../models/portfolio-cms/contact.models.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const saveContact = async (req, res) => {
  const { name, contact_type, message } = req.body;
  const newContact = await Contact.create({
    name,
    contact_type,
    message,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newContact, "Contact created successfully"));
};
