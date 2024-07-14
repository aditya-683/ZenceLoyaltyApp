import * as mongoose from 'mongoose';
const cartAttrSchema = new mongoose.Schema(
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
    checkoutToken: {
      unique: true,
      type: String,
    },
    cartToken: {
      type: String,
    },
    points: {
      type: String,
    },
    coupon: {
      type: String,
    },
    phone: {
      default:"0",
      type: String,
      default: "0"
    },
    isSaveSkuSent: {
      type: Boolean,
      default: false,
    },
    saveSkuResponse: {
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

export const CartAttr = mongoose.model("CartAttr", cartAttrSchema);

