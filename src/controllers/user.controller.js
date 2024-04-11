import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "./../utils/apiError.js";
import { User } from "./../models/user.model.js";
import { fileUpload } from "./../utils/fileUpload.js";
import { ApiResponse } from "./../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  // Get the user details
  const { fullName, username, email, password } = req.body;
  // console.log(email);

  // Validate the details : Not Empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!!!");
  }

  // Check if the user alredy exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      400,
      "The user with this username or email alredy exists."
    );
  }

  // Check the Images - avtar is required
  const avtarLocalPath = await req.files?.avtar[0]?.path;
  const coverImageLocalPath = await req.files?.coverImage[0]?.path;

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avtar file is required!!!");
  }

  // console.log(avtarLocalPath);
  // console.log(coverImageLocalPath);

  // Upload the images on cloudinary
  const avtar = await fileUpload(avtarLocalPath);
  const coverImage = await fileUpload(coverImageLocalPath);
  console.log("Cloudinary Avtar:", avtar);
  console.log("Cloudinary coverImage:", coverImage);

  // Create the user object in the db
  const newUser = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Check if the user is created
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while creating the user");
  }

  // Sent Response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Sucessfully!!!"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credentials!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn Sucessfully!!!"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout Sucessfully!!!"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingAccessToken = req.cookies.accessToken || req.body.accessToken;

  if (!incomingAccessToken) {
    throw new ApiError(400, "Unauthorized Access Token");
  }

  try {
    const decodedAccessToken = jwt.verify(
      incomingAccessToken,
      process.env.REFRESH_TOEKN_SECRET
    );

    const user = await User.findById(decodedAccessToken._id);
    if (!user) {
      throw new ApiError(404, "Invalid Access Token");
    }

    if (incomingAccessToken !== user.refreshToken) {
      throw new ApiError(401, "Unauthorized Access Token");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("acessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Acess Token is Updated"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid Access Token");
  }
});
