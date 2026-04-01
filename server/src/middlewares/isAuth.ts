import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../config/redis";
import UserModel from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: any;
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
    const cacheUser = await client.get(
      `user:${(decodedData as JwtPayload)._id}`,
    );
    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      return next();
    }
    const user = await UserModel.findById((decodedData as JwtPayload)._id);

    await client.setEx(
      `user:${(user as JwtPayload)._id}`,
      3600,
      JSON.stringify(user),
    );
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
}

export { isAuth };
