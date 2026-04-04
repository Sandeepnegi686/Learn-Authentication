import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../config/redis";
import UserModel from "../models/userModel";
import { isSessionActive } from "../config/generateToken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      sessionId?: string;
    }
  }
}

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "";

async function isAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res
        .status(403)
        .json({ success: false, message: "Please Login - no token" });
    }
    const decodedData = jwt.verify(token, JWT_SECRET);
    if (!decodedData) {
      return res.status(403).json({ success: false, message: "Token expired" });
    }
    const decoded = decodedData as JwtPayload;

    const sessionActive = await isSessionActive(decoded._id, decoded.sessionId);
    if (!sessionActive) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("csrfToken");
      return res
        .status(401)
        .json({ success: false, message: "Session expired" });
    }

    const cacheUser = await client.get(`user:${decoded._id}`);
    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      req.sessionId = decoded.sessionId;
      return next();
    }
    const user = await UserModel.findById(decoded._id);

    await client.setEx(
      `user:${(user as JwtPayload)._id}`,
      3600,
      JSON.stringify(user),
    );
    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    console.log(error);
  }
}

async function authorizedAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "You are not allowed for this activity.",
    });
  }
  next();
}

export { isAuth, authorizedAdmin };
