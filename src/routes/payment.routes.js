import { Router } from "express";
import {
  getClientToken,
  paymentCheckout,
  stripePayment,
} from "../controllers/payment.controllers.js";

const router = Router();

router.route("/client_token").get(getClientToken);
router.route("/checkout").post(paymentCheckout);
router.route("/stripe").post(stripePayment);

export default router;
