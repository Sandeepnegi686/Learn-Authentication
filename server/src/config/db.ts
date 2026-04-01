import { connect, set } from "mongoose";

async function ConnectDB(url: string) {
  try {
    await connect(url);
    set("sanitizeFilter", true);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
export default ConnectDB;
