import {
  saveAppSettingsService,
  getAppSettingsService,
} from "../service/settings.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const saveAppSettingsController = CatchAsync(async (req, res) => {
  const saveAppSettingResponse = await saveAppSettingsService(req);
  return res.send(saveAppSettingResponse);
});

export const getAppSettingsController = CatchAsync(async (req, res) => {
  console.log("getAppSettingsController -----------------------");
  console.log("getAppSettingsController -----------------------");
  console.log("getAppSettingsController -----------------------");
  console.log("getAppSettingsController -----------------------");
  const getAppSettingsData = await getAppSettingsService(req, res);
  return res.send(getAppSettingsData);
});
