import { Request, Response } from "express";
import TryCatch from "../middlewares/TryCatch";

TryCatch;
const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
});
