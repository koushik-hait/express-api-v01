import express from "express";
import {
  addTransaction,
  deleteTransaction,
  getAllTransaction,
  updateTransaction,
} from "../controllers/expence-tracker-app/transaction.controllers.js";

const router = express.Router();

router.route("/add-transaction").post(addTransaction);

router.route("/get-transaction").post(getAllTransaction);

router.route("/delete-transaction/:tid").post(deleteTransaction);

router.route("/update-transaction/:tid").put(updateTransaction);

export default router;
