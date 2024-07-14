import { FtpSettings } from "../model/ftpSettings.modal.js";

import * as cron from "node-cron"

export const saveFtpSettingsService = async (req) => {
  try {
    if (Object.keys(req.body).length <= 0) {
      //if empty body
      // res.status = 200; 
      return {
        status: 200,
        message: "Do not send Empty body",
        data: null,
      }

    };

    const store = req.body.store || req.query.shop;
    let ftpConfig = await FtpSettings.findOne({
      StoreName: store,
      isDeleted: false
    });

    console.log("ftpConfig=", ftpConfig);

    if (!ftpConfig && Object.keys(!ftpConfig && {}).length <= 0) {
      ftpConfig = await FtpSettings.create({
        StoreName: req.body.store || req.query.shop,
        isReconAllowed: req.body.isReconAllowed,
        timezone: req.body.timezone,
        cronTime: req.body.cronTime,
        host: req.body.host,
        password: req.body.password,
        path: req.body.path,
        isDeleted: false
      });

      res_object = {
        status: 200,
        message: "Created New FTP Settings",
        data: ftpConfig,
      }
      return res_object;

    } else {
      const res_object = {
        status: 200,
        message: "Settings Already Exist for store=" + req.body.store,
        data: ftpConfig,
      }
      return res_object;
    }
  } catch (error) {
    console.log(error);
    // const statusCode = error.status || 500;
    const res_object = {
      status: error.status || 500,
      message: "Error:" + error.message || "Something Went Wrong",
      data: error,
    }
    return res_object;
  }
};


export const updateFtpSettingsService = async (req) => {
  try {
    await FtpSettings.findOneAndUpdate(
      {
        StoreName: req.body.store || req.query.shop,
        isDeleted: false
      },
      {
        $set: {
          ...req.body,
        },
      },
      {
        upsert: true,
      }
    );

    const ftpConfig = await FtpSettings.findOne({
      StoreName: req.body.store || req.query.shop,
      isDeleted: false
    });

    return {
      status: 200,
      message: "Update for store=" + req.body.store,
      data: ftpConfig,
    };

  } catch (error) {
    console.log(error);
    // const statusCode = error.status || 500;
    const res_object = {
      status: error.status || 500,
      message: "Error:" + error.message || "Something Went Wrong",
      data: error,
    }
    return res_object;
  }
};


export const getFtpSettingsService = async (req) => {
  // console.log("inside get ftp ")
  try {
    const store = req.query.store || req.query.shop;
    const ftpConfig = await FtpSettings.findOne({
      StoreName: store,
      isDeleted: false
    });

    if (!ftpConfig && Object.keys(!ftpConfig && {}).length <= 0) {
      // status_code:200 ,
      const res_object = {
        message: "No Data Found for store=" + req.query.store,
        data: ftpConfig,
      }
      return {
        status: 200,
        data: res_object
      };

    } else {
      // status_code:200 ,
      const res_object = {
        status: 200,
        message: "Get FTP settings for store=" + req.query.store,
        data: ftpConfig,
      }
      return res_object;
    }
  } catch (error) {
    console.log(error);
    const res_object = {
      status: error.status || 500,
      message: "Error:" + error.message || "Something Went Wrong",
      data: error,
    }
    return res_object
  }
};

// export  { saveFtpSettingsService, updateFtpSettingsService, getFtpSettingsService };