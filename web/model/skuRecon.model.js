import mongoose from "mongoose";
const skuReconSchema = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    orderId: {
      type: String,
    },
    orderName: {
      type: String,
    },
    orderObject: {
      type: Array,
    },
    apiDescription: {
      type: Array,
      default: [],
    },
    invoideIdMap: {
      type: Object,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const SkuReconModel = mongoose.model("SkuRecon", skuReconSchema);

