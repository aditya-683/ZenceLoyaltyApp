//  import mongoose from "mongoose";
import * as mongoose from 'mongoose';
const ftpSettings = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    isReconAllowed: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "",
    },
    cronTime: {
      type: String,
      default: "",
    },
    host: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    path: {
      type: String,
      default: "",
    },
    port: {
      type: String,
      default: "",
    },
    remoteDir: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const FtpSettings = mongoose.model("FtpSettings", ftpSettings);
// export default FtpSettings;

