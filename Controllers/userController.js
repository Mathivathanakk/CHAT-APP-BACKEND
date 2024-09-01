import User from "../Models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../Middlewares/verifyToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, profile_pic } = req.body;

    if (
      name === "" ||
      email === "" ||
      password === "" ||
      !name ||
      !email ||
      !password
    ) {
      return res
        .status(404)
        .json({ message: "Please fill out the field", error: true });
    }

    //checking the user exists or not
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(404)
        .json({ message: "User already exist", error: true });
    }

    //hashing the password

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      profile_pic,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(200).json({
      message: "User Registered Successfully",
      data: newUser,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error in registering the user" || error.message,
      error: true,
    });
  }
};

//Checking the Email

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const exists = await User.findOne({ email }).select("-password");
    if (!exists) {
      return res.status(404).json({ message: "User not found", error: true });
    }

    return res
      .status(200)
      .json({ message: "User email verified", data: exists, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "Internal Server Error in the verifing the email" || error.message,
      error: true,
    });
  }
};

//checking the password

export const checkPassword = async (req, res) => {
  try {
    const { password, userId } = req.body;

    const user = await User.findById(userId);

    const passwordMatch = await bcryptjs.compareSync(password, user.password);

    if (!passwordMatch) {
      res.status(404).json({ message: "Invalid credential", error: true });
    }

    //jwt token Creation

    const tokenData = {
      id: user._id,
      email: user.email,
    };

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY);

    const cookieOptions = {
      http: true,
      secure: true,
    };

    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ message: "Login Successfully", token: token, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "Internal Server Error in the verifing the password" || error.message,
      error: true,
    });
  }
};

//getting  the userdetails

export const userDetails = async (req, res) => {
  try {
    const token = req.cookies.token || "";
    ///console.log(token);

    const user = await verifyToken(token);

    return res
      .status(200)
      .json({ message: "user details", data: user, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "Internal Server Error in the getting the user details" ||
        error.message,
      error: true,
    });
  }
};

//logout

export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = { http: true, secure: true };

    return res
      .cookie("token", "", cookieOptions)
      .status(200)
      .json({ message: "logout Successfully", success: true });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error in the logout user" || error.message,
      error: true,
    });
  }
};

//updating the user details

export const updateUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token || "";
   // console.log(token);

    const user = await verifyToken(token);

    const { name, profile_pic } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      {
        _id: user._id,
      },
      { $set: { name: req.body.name, profile_pic: req.body.profile_pic } },
      { new: true }
    );

    const userInformation = await User.findById(user._id);

    return res.status(200).json({
      message: "User updated Successfully",
      data: userInformation,
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message:
        "Internal Server Error in the updating the user" || error.message,
      error: true,
    });
  }
};

//search user

export const searchUser = async (req, res) => {
  try {
    const { search } = req.body;

    const query = new RegExp(search, "i", "g");

    const user = await User.find({
      $or: [
        {
          name: query,
        },
        {
          email: query,
        },
      ],
    }).select("-password");

    return res
      .status(200)
      .json({ message: "All user", data: user, success: true });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error in searching the user" || error.message,
      error: true,
    });
  }
};
