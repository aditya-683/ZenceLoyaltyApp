import * as mongoose from "mongoose";

const uiSettingSchema = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    modal1: {
      heading: {
        type: String,
      },
      customMessage: {
        type: String,
      },
      submitButtonText: {
        type: String,
      },
      submitButtonColor: {
        type: String,
      },
      cancelButtonText: {
        type: String,
      },
      cancelButtonColor: {
        type: String,
      },
    },
    modal2: {
      heading: {
        type: String,
      },
      submitButtonText: {
        type: String,
      },
      submitButtonColor: {
        type: String,
      },
      cancelButtonText: {
        type: String,
      },
      cancelButtonColor: {
        type: String,
      },
    },
    modal3: {
      heading: {
        type: String,
      },
      submitButtonText: {
        type: String,
      },
      submitButtonColor: {
        type: String,
      },
      cancelButtonText: {
        type: String,
      },
      cancelButtonColor: {
        type: String,
      },
    },
    redeemButton: {
      buttonColor: {
        type: String,
      },
      domSelector: {
        type: String,
      },
    },
  },
<<<<<<< HEAD
  { timestamps: true }
);
=======
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })
>>>>>>> 54b9ad0e7e8bd3b7338d3922569270cd80c4d297

export const UiSetting = mongoose.model("UiSetting", uiSettingSchema);
