import Client from "ssh2-sftp-client";
import { FtpSettings } from "../model/ftpSettings.modal.js";

let sftp = new Client();

export const sftpService = async (req) => {
  const data = req.body;
  console.log("data", data);
  if (!data) {
    return {
      status: "200",
      data: "",
      message: "Please provide the details!",
    };
  }

  const ftpDetails = FtpSettings.find({ StoreName: data?.StoreName });
  console.log("ftpDetails", ftpDetails);

  const sftpConfig = {
    host: data?.host || ftpDetails?.host || "",
    port: data?.port || ftpDetails?.port || "",
    username: data?.username || ftpDetails?.username || "",
    password: data?.password || ftpDetails?.password || "",
  };

  try {
    console.log("sftpConfig", sftpConfig);
    const sftpConnect = await sftp.connect(sftpConfig);
    console.log("connect successfully", sftpConnect);

    const deleteConnection = await sftp.end();
    console.log("deleteConnection", deleteConnection);
    return {
      status: "200",
      data: "data is valid",
      message: "",
    };
  } catch (err) {
    return {
      status: "500",
      data: "",
      message: err,
    };
  }
};
