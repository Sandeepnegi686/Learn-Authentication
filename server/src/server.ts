import express from "express";
import dotenv from "dotenv";

import ConnectDB from "./config/db";
import userRouter from "./routes/user";
dotenv.config();

const PORT = process.env.PORT || 80;
const DB_URL = process.env.DB_URL || "";

const app = express();

//Importing Routers
app.use("/api/v1", userRouter);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
  ConnectDB(DB_URL);
});
