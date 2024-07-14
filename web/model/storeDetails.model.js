import * as mongoose from 'mongoose';
const storeDetailsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
    },
    name: {
      type: String,
    },
    companyName: {
        type: String,
      },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    email: {
      unique: true,
      type: String,
    },
    unInstalled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const StoreDetails= mongoose.model("StoreDetails", storeDetailsSchema);

