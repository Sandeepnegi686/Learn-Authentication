import transpoter from "../config/transpoter";

async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transpoter.sendMail({
      from: "MY APP",
      to,
      subject,
      html,
    });
    console.log("Email sent", info.messageId);
  } catch (error) {
    console.log(error);
    console.log("Email error", error);
  }
}

export default sendMail;
