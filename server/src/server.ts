import express from "express";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";

import ConnectDB from "./config/db";
import userRouter from "./routes/user";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 80;
const DB_URL = process.env.DB_URL || "";

const app = express();
app.use(express.json());
app.use(cookieParser());
// mongo-sanitize
//Importing Routers
app.use("/api/v1", userRouter);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
  ConnectDB(DB_URL);
});
