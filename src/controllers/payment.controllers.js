import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BraintreeGateway } from "../utils/braintree.js";
import { stripePay } from "../utils/stripePay.js";

export const getClientToken = async (req, res) => {
  const customerId = "CUS-" + uuidv4();
  BraintreeGateway.clientToken.generate(
    {
      customerId: customerId,
    },
    (err, response) => {
      if (err) {
        return res
          .status(error.statusCode || 500)
          .json(
            new ApiResponse(
              error.statusCode || 500,
              null,
              error.message || "Internal Server Error"
            )
          );
      } else {
        console.log(response.clientToken);
        const data = {
          clientToken: response.clientToken,
          customerId: customerId,
        };
        return res
          .status(200)
          .json(
            new ApiResponse(200, data, "Client Token Generated Successfully")
          );
      }
    }
  );
};

export const paymentCheckout = async (req, res) => {
  const { amount, paymentMethodNonce, customerId } = req.body;
  const result = await BraintreeGateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: paymentMethodNonce,
    customerId: customerId,
    options: {
      submitForSettlement: true,
    },
  });
  if (result.success) {
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Transaction successful"));
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, result, "Transaction failed"));
  }
};

export const stripePayment = async (req, res) => {
  const { products } = req.body;
  console.log(products);

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.description,
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));

  const session = await stripePay.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/sucess",
    cancel_url: "http://localhost:5173/cancel",
  });

  res
    .status(200)
    .json(new ApiResponse(200, { id: session.id }, "Payment successful"));
};
