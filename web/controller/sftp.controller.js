import { sftpService } from "../service/sftp.service.js";

export const sftpController = async (req, res) => {
  try {
    const response = await sftpService(req);
    console.log("response in sftp Controller", response);
    return res.status(200).send(
      response || {
        status: "200",
        data: "no data in response",
        messaage: "",
      }
    );
  } catch {
    return res.status(500).send({
      status: "500",
      data: "",
      messaage: err,
    });
  }
};
