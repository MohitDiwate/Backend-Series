import { asyncHandler } from "./../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  return res.status(201).json({
    status: "Success",
    message: "User Registered Sucessfully!",
  });
});
