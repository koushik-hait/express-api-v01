import { Router } from "express";
import { saveContact } from "../../controllers/portfolio-cms/contact.controllers.js";

const router = Router();

router.route("/contact/save").post(saveContact);

export default router;
