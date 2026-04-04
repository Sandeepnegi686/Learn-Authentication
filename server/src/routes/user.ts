import express, { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  myProfile,
  refresh_token,
  registerUser,
  verifyOTP,
  verifyuser,
} from "../controller/User";
import { isAuth } from "../middlewares/isAuth";
import { refreshCSRFToken, verifyCSRFToken } from "../config/csrfMiddlewares";
import UserModel from "../models/userModel";

const router = express.Router();

router.post("/register", registerUser);

router.get("/token/:token", verifyuser);

router.post("/login", loginUser);
router.post("/verifyOTP", verifyOTP);

router.get("/me", isAuth, myProfile);

router.post("/refresh", refresh_token);

router.post("/logout", isAuth, verifyCSRFToken, logoutUser);

router.post("/refresh-csrf", isAuth, refreshCSRFToken);

router.post("/update-name", isAuth, async (req: Request, res: Response) => {
  console.log(req.body);
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name },
    { returnDocument: "after" },
  );
  return res.status(200).json({ success: true, message: "name is updated" });
});

export default router;
