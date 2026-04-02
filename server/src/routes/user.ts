import express from "express";
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

const router = express.Router();

router.post("/register", registerUser);
router.get("/token/:token", verifyuser);

router.post("/login", loginUser);
router.post("/verifyOTP", verifyOTP);

router.get("/me", isAuth, myProfile);

router.post("/refresh", refresh_token);

router.post("/logout", isAuth, logoutUser);

export default router;
