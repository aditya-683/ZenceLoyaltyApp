import mongoose from "mongoose";
const appLogSchema = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    ip_address: {
      type: String,
    },
    er_endpoint: {
      type: String,
    },
    middleware_endpoint: {
      type: String,
    },
    request_body: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {},
    isDeleted: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true }
);

export const AppLogs = mongoose.model("newApiModals", appLogSchema);

