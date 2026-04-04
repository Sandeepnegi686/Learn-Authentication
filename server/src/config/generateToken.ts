import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Response } from "express";
import crypto from "crypto";
import client from "./redis";
import { generateCSRFToken, revokecsrfToken } from "./csrfMiddlewares";
import { decode } from "punycode";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "";

async function generateToken(id: string, res: Response) {
  const sessionId = await crypto.randomBytes(16).toString("hex");

  const accessToken = jwt.sign({ _id: id, sessionId }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ _id: id, sessionId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refresh_token:${id}`;
  const activeSessionKey = `active_session:${id}`;
  const sessionDataKey = `session:${sessionId}`;

  const existingSession = await client.get(activeSessionKey);
  if (existingSession) {
    await client.del(activeSessionKey);
    // await client.del(refreshTokenKey); // can be changed
    await client.del(refreshToken); // can be changed
  }

  const sessionData = {
    userId: id,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  await client.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);
  await client.setEx(
    sessionDataKey,
    7 * 24 * 60 * 60,
    JSON.stringify(sessionData),
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  const csrfToken = await generateCSRFToken(id, res);
  // console.log(csrfToken);
  return { accessToken, refreshToken, csrfToken, sessionId };
}

async function verifyRefreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const storedToken = await client.get(
      `refresh_token:${(decoded as JwtPayload)._id}`,
    );

    if (storedToken! == refreshToken) {
      return null;
    }
    const activeSessionId = await client.get(
      `active_session:${(decoded as JwtPayload)._id}`,
    );
    if (activeSessionId !== (decoded as JwtPayload).sessionId) {
      return null;
    }
    const sessionData = await client.get(
      `session:${(decoded as JwtPayload).sessionId}`,
    );
    if (!sessionData) return null;

    const parsedSesseionData = JSON.parse(sessionData);
    parsedSesseionData.lastActivity = new Date().toISOString();
    await client.setEx(
      `session:${(decoded as JwtPayload).sessionId}`,
      60 * 60 * 24 * 7,
      JSON.stringify(parsedSesseionData),
    );
    return decoded;
  } catch (error) {
    return null;
  }
}

async function generateAccesssToken(
  _id: string,
  sessionId: string,
  res: Response,
) {
  const accessToken = jwt.sign({ _id, sessionId }, JWT_SECRET, {
    expiresIn: "15m",
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 1000 * 60,
  });
}

async function revokeRefreshToken(_id: string) {
  const activeSessionId = await client.get(`active_session:${_id}`);
  await client.del(`refresh_token:${_id}`);
  await client.del(`active_session:${_id}`);
  await revokecsrfToken(_id);

  if (activeSessionId) {
    await client.del(`session:${activeSessionId}`);
  }
}

async function isSessionActive(userId: string, sessionId: string) {
  const activeSessionId = await client.get(`active_session:${userId}`);
  return activeSessionId === sessionId;
}

export {
  generateToken,
  verifyRefreshToken,
  generateAccesssToken,
  revokeRefreshToken,
  isSessionActive,
};
