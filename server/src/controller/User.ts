import { Request, Response } from "express";
import { sanitizeFilter } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import TryCatch from "../middlewares/TryCatch";
import { validateLogin, validateRegister } from "../lib/validate";
import sendMail from "../lib/sendEmail";
import client from "../config/redis";
import UserModel from "../models/userModel";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html";
import {
  generateAccesssToken,
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../config/generateToken";
import { JwtPayload } from "jsonwebtoken";
import { generateCSRFToken } from "../config/csrfMiddlewares";

const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { name, email, password } = req.body;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
  const keyPresent = await client.get(rateLimitKey);

  if (keyPresent) {
    return res
      .status(429)
      .json({ success: false, message: "Too many request" });
  }
  const existingUser = await UserModel.findOne({
    email: sanitizeFilter(email),
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exits" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //TOKEN = asdfasdfasdfasdf
  //http://localhost:3000/token/asdfasdfasdfasdf
  const verifyToken = await crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${verifyToken}`;
  const dataToStore = JSON.stringify({ name, email, password: hashedPassword });

  await client.set(verifyKey, dataToStore, {
    expiration: { type: "EX", value: 300 },
  });

  await sendMail(
    email,
    "Confirm your email",
    getVerifyEmailHtml(email, verifyToken),
  );

  await client.set(rateLimitKey, "true", {
    expiration: { type: "EX", value: 60 },
  });

  return res.status(201).json({
    success: true,
    message:
      "If your email is valid, verification email is sent. It will expire in 5 minutes.",
    user: JSON.parse(dataToStore),
  });
});

const verifyuser = TryCatch(async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token || !(token.length !== 32)) {
    return res
      .status(400)
      .json({ success: false, message: "Token not provided" });
  }
  const verifyKey = `verify:${token}`;
  const userJsonData = await client.get(verifyKey);
  if (!userJsonData) {
    return res
      .status(400)
      .json({ success: false, message: "Verification link is expired" });
  }

  await client.del(verifyKey);
  const userData = JSON.parse(userJsonData);
  const user = await UserModel.create(userData);

  return res.status(201).json({
    success: true,
    message: "Email verified successfully",
    user,
  });
});

const loginUser = TryCatch(async (req: Request, res: Response) => {
  await client.del("user:69cd127108cc14038ce78ffd");
  const { error } = validateLogin(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { email, password } = req.body;

  const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;
  const keyPresent = await client.get(rateLimitKey);
  if (keyPresent) {
    return res
      .status(429)
      .json({ success: false, message: "Too many request" });
  }
  const user = await UserModel.findOne({ email: sanitizeFilter(email) }).select(
    "+password",
  );
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Credentials" });
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Credentials" });
  }
  const otpKey = `otp:${email}`;
  const otp = Math.floor(Math.random() * 900000 + 100000).toString();
  await client.set(otpKey, otp, {
    expiration: { type: "EX", value: 300 },
  });
  const subject = "OTP for verification";
  console.log("OTP", otp);
  const HTML = getOtpHtml(email, otp);
  await sendMail(email, subject, HTML);
  await client.set(rateLimitKey, "true", {
    expiration: { type: "EX", value: 60 },
  });

  return res.status(200).json({
    success: true,
    message: "An OTP is sent to your email",
    user: { email: user.email },
  });
});

const verifyOTP = TryCatch(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all details" });
  }

  const otpKey = `otp:${email}`;
  const otpValue = await client.get(otpKey);

  if (!otpValue) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  const storedOTP = JSON.parse(otpValue);
  if (storedOTP != otp) {
    return res.status(400).json({ success: false, message: "Wrong OTP" });
  }
  await client.del(otpKey);
  const user = await UserModel.findOne({ email: sanitizeFilter(email) });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid Email" });
  }
  const tokenData = await generateToken(user._id.toString(), res);

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    user,
    sessionInfo: {
      sessionId: tokenData.sessionId,
      loginTime: new Date().toISOString(),
      csrfToken: tokenData.csrfToken,
    },
  });
});

const myProfile = TryCatch(async (req: Request, res: Response) => {
  const user = req.user;
  const sessionId = await req.sessionId;
  const sessionData = await client.get(`session:${sessionId}`);
  let sessionInfo = null;
  if (sessionData) {
    const parshedSession = JSON.parse(sessionData);
    sessionInfo = {
      sessionId,
      loginTime: parshedSession.createdAt,
      lastActivity: parshedSession.lastActivity,
    };
  }

  return res.json({ user, sessionInfo });
});

const refresh_token = TryCatch(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "invalid refresh token" });
  }
  const decode = await verifyRefreshToken(refreshToken);

  if (!decode) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("csrfToken");
    return res
      .status(401)
      .json({ success: false, message: "invalid session expired" });
  }

  await generateAccesssToken(
    (decode as JwtPayload)._id,
    (decode as JwtPayload).sessionId,
    res,
  );

  return res.status(200).json({ success: true, message: "Token refresh" });
});

const logoutUser = TryCatch(async (req: Request, res: Response) => {
  await revokeRefreshToken(req.user._id);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");
  await client.del(`user:${req.user._id}`);
  return res
    .status(200)
    .json({ success: true, message: "Logout successfully" });
});

const refreshCSRFToken = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const newCSRFToken = await generateCSRFToken(userId, res);
  res.status(200).json({
    success: true,
    message: "CSRF Token refreshed",
    CSRFToken: newCSRFToken,
  });
});

const adminController = TryCatch(async (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "you are authorized" });
});

export {
  registerUser,
  verifyuser,
  loginUser,
  verifyOTP,
  myProfile,
  refresh_token,
  logoutUser,
  refreshCSRFToken,
  adminController,
};
