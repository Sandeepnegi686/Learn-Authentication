import { Request, Response } from "express";
import TryCatch from "../middlewares/TryCatch";
import { sanitizeFilter } from "mongoose";
import { validateRegister } from "../lib/validate";
import transpoter from "../config/transpoter";
import sendMail from "../lib/sendEmail";

// TryCatch;
//
const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const html = `<h1>Hello ${req.body.name}</h1>`;
  await sendMail(req.body.email, "Demo", html);
  return res
    .status(201)
    .json({ success: true, message: "user created", user: req.body });
});

export { registerUser };
