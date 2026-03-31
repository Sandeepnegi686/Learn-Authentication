import { connect } from "mongoose";

async function ConnectDB(url: string) {
  try {
    await connect(url);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
export default ConnectDB;
