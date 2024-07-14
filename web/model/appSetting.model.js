// const mongoose = require("mongoose");
import * as mongoose from 'mongoose';
const appSettingSchema = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    domainName: {
      type: String,
    },
    webhooksAllowed: [String],
    useOrderCreateHook: {
      type: Boolean,
      default: false,
    },
    isTestMode: {
      type: Boolean,
      default: true,
    },
    testThemeId: {
      type: String,
    },
    useOrderFulfillHook: {
      type: Boolean,
      default: false,
    },
    useOrderCancelHook: {
      type: Boolean,
      default: false,
    },
    useOrderReturnHook: {
      type: Boolean,
      default: false,
    },
    usePointsAsTender: {
      type: Boolean,
      default: false,
    },
    useTaxSettingsExclProduct: {
      type: Boolean,
      default: false,
    },
    allowGuestRegistrationOnOrderPlace: {
      type: Boolean,
      default: false,
    },
    usePhoneFromShippingForRegistration: {
      type: Boolean,
      default: false,
    },
    callSaveSkuForGuestOrders: {
      type: Boolean,
      default: false,
    },
    isAppDisabled: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    couponWithoutOtp: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const AppSetting = mongoose.model("AppSetting", appSettingSchema);
//  export default AppSetting

