import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "./../utils/apiError.js";
import { User } from "./../models/user.model.js";
import { fileUpload } from "./../utils/fileUpload.js";
import { ApiResponse } from "./../utils/apiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  // Get the details of the user
  const { fullName, username, email, password } = req.body;
  console.log({ email });

  // Validate the user - not empty
  if (
    [fullName, username, email, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!!");
  }

  // Check if the user alredy exists
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User with this username or email alredy exists");
  }

  //check the images - avatar file is required
  const avtarLocalPath = req.files?.avtar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avtar file is required!!");
  }

  // Upload the images on cloudinary
  const avtar = await fileUpload(avtarLocalPath);
  const coverImage = await fileUpload(coverImageLocalPath);

  if (!avtar) {
    throw new ApiError(400, "Avtar file is required");
  }

  // Create the user object in db
  const newUser = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove the password and refreshToken fields
  const createdUser = User.findById(newUser._id).select(
    "-password -rerefreshToken"
  );

  // Check if the user is created
  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while creating the user");
  }

  // Sent the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registerd successfully!"));
});
