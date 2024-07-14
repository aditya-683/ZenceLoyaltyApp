import * as mongoose from "mongoose";

const addressReconSchama = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    Date: {
      type: String,
    },
    BillId: {
      type: String,
    },
    MemberId: {
      type: String,
    },
    AddressId: {
      type: String,
    },
    Addresstype: {
      type: String,
    },
    CustomerName: {
      type: String,
    },
    CountryCode: {
      type: String,
    },
    Mobile: {
      type: String,
    },
    Country: {
      type: String,
    },
    State: {
      type: String,
    },
    City: {
      type: String,
    },
    Landmark: {
      type: String,
    },
    AddressLine1: {
      type: String,
    },
    AddressLine2: {
      type: String,
    },
    DefaultAddress: {
      type: String,
    },
    Pincode: {
      type: String,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const AddressReconModel = mongoose.model(
  "AddressReconModel",
  addressReconSchama
);
