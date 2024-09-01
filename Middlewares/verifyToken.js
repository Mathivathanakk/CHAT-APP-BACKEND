import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (token) => {
    
  if (!token) {
    return {
      message: "Session Out",
      logout: true,
    };
  }

  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decode.id).select("-password");

  return user;
};
