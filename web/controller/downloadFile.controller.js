import { downloadFile } from "../service/reconFiles.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const downloadReconFileController = CatchAsync(
  async (req, res, next) => {
    console.log("donwload_RecondFile_Controller");
    const { status, body } = await downloadFile(req, res, next);
    return res.status(status).send(body);
  }
);
