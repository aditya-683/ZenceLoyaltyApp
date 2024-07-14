import {
  getFtpSettingsService,
  saveFtpSettingsService,
  updateFtpSettingsService,
} from "../service/ftpSettings.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const SaveFtpSettingsController = CatchAsync(async (req, res, next) => {
  const { status, message, data } = await saveFtpSettingsService(
    req,
    res,
    next
  );
  return res.status(status).json({ message, status, data });
});

export const UpdateFtpSettingsController = CatchAsync(
  async (req, res, next) => {
    const { status, message, data } = await updateFtpSettingsService(
      req,
      res,
      next
    );
    return res.status(status).json({ status, message, data });
  }
);

export const GetFtpSettingsController = CatchAsync(async (req, res, next) => {
  const { status, message, data } = await getFtpSettingsService(req, res, next);
  return res.status(status).json({ status, message, data });
});
