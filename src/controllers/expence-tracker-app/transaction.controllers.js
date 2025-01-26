import Transaction from "../../models/expence-tracker-app/transaction.model.js";
import User from "../../models/auth/user.model.js";

export const addTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
    } = req.body;

    // console.log(title, amount, description, date, category, userId, transactionType);

    if (
      !title ||
      !amount ||
      !description ||
      !date ||
      !category ||
      !transactionType
    ) {
      return res.status(408).json({
        success: false,
        messages: "Please Fill all fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    let newTransaction = await Transaction.create({
      title: title,
      amount: amount,
      category: category,
      description: description,
      date: date,
      user: userId,
      transactionType: transactionType,
    });

    user.transactions.push(newTransaction);

    user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};
export const deleteTransaction = (req, res) => {
  const { tid } = req.params;
  res.status(200).json({
    message: "Transaction deleted successfully",
    transactionId: tid,
  });
};
export const getAllTransaction = (req, res) => {
  res.status(200).json({
    message: "Transactions fetched successfully",
    transactions: req.body,
  });
};

export const updateTransaction = (req, res) => {
  const { tid } = req.params;
  res.status(200).json({
    message: "Transaction updated successfully",
    transactionId: tid,
  });
};
