import express from "express";
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createAddressSchema,
  updateAddressSchema,
  idParamSchema,
} from "../validators/user-features.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAddresses);
router.get("/:id", validateParams(idParamSchema), getAddress);
router.post("/", validateBody(createAddressSchema), createAddress);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateAddressSchema }),
  updateAddress,
);
router.delete("/:id", validateParams(idParamSchema), deleteAddress);
router.post("/:id/default", validateParams(idParamSchema), setDefaultAddress);

export default router;
