import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Response } from "express";
import client from "./redis";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "";

async function generateToken(id: string, res: Response) {
  const accessToken = jwt.sign({ _id: id }, JWT_SECRET, { expiresIn: "1m" });
  const refreshToken = jwt.sign({ _id: id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refresh_token:${id}`;
  await client.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "strict",
    maxAge: 1 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    //secure: true,
  });
  return { accessToken, refreshToken };
}

async function verifyRefreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const storedToken = await client.get(
      `refresh_token:${(decoded as JwtPayload)._id}`,
    );
    if (storedToken === refreshToken) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function generateAccesssToken(_id: string, res: Response) {
  const accessToken = jwt.sign({ _id }, JWT_SECRET, { expiresIn: "1m" });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60,
  });
}

async function revokeRefreshToken(_id: string) {
  await client.del(`refresh_token:${_id}`);
}

export {
  generateToken,
  verifyRefreshToken,
  generateAccesssToken,
  revokeRefreshToken,
};
