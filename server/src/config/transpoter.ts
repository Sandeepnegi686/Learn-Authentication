import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GOOGLE_EMAIL, pass: process.env.GOOGLE_PASS },
});

export default transpoter;
