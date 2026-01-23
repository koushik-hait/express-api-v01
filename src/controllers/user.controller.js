/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Public
 */
export const getUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Doe", email: "jane@example.com" },
    ],
  });
};

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Public
 */
export const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      status: "error",
      message: "Please provide name and email",
    });
  }

  res.status(201).json({
    status: "success",
    data: { id: Date.now(), name, email },
  });
};
