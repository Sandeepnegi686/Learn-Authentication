import express from "express";
import {
  loginUser,
  registerUser,
  verifyOTP,
  verifyuser,
} from "../controller/User";
const router = express.Router();

router.post("/register", registerUser);
router.get("/token/:token", verifyuser);

router.post("/login", loginUser);
router.post("/verifyOTP", verifyOTP);

export default router;
