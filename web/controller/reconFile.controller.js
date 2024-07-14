import {
  createSkuAndTenderReconFileForDownload,
  downloadFile,
} from "../service/reconFiles.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const postReconFileController = CatchAsync(async (req, res, next) => {
  const postReconFileResponse = await createSkuAndTenderReconFileForDownload(
    req
  );
  return res.send(postReconFileResponse);
});

export const postDownloadFileController = CatchAsync(async (req, res, next) => {
  const { status, body } = await downloadFile(req);
  return res.status(status).send(body);
});
