import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const url = process.env.REDIS_URL || "";
const client = createClient({
  url,
});

client
  .on("error", (err) => {
    console.error("Redis Client Error", err);
  })
  .connect()
  .then(() => console.log("Redis Connected"));

export default client;
