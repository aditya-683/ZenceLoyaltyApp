import * as mongoose from "mongoose";
const storeSchema = new mongoose.Schema(
  {
    StoreName: {
      type: String,
    },
    isUser: {
      type: String,
      default: "plus",
    },
    jwtToken: {
      type: String,
    },

    AccessToken: {
      type: String,
    },
    customeToken: {
      type: String,
    },
    allowOrigin: {
      type: String,
    },
    appAccessToken: {
      type: String,
    },
    UserName: {
      type: String,
    },
    UserName2: {
      type: String,
    },
    UserPassword: {
      type: String,
    },
    DevId: {
      type: String,
    },
    AppId: {
      type: String,
    },
    MultiPassSecret: {
      type: String,
    },
    ErBaseUrl: {
      type: String,
    },
    CountryCode: {
      type: String,
    },
    ProgramCode: {
      type: String,
    },
    StoreCode: {
      type: String,
    },
    ActivityCode: {
      type: String,
    },
    Status: {
      type: String,
    },
    PointRate: {
      type: Number,
    },
    Selector: {
      type: String,
    },
    domainName: {
      type: String,
    },
    isPlusStore: {
      type: Boolean,
    },
    Modal1: {
      Heading: {
        type: String,
      },
      CustomMessage: {
        type: String,
      },
      SubmitButtonText: {
        type: String,
      },
      SubmitButtonColor: {
        type: String,
      },
      CancelButtonText: {
        type: String,
      },
      CancelButtonColor: {
        type: String,
      },
      RedeemPointsButtonColor: {
        type: String,
      },
      RedeemPointsBgColor: {
        type: String,
      },
      RedeemPointsButtonText: {
        type: String,
      },
      ApplyCouponButtonColor: {
        type: String,
      },
      ApplyCouponButtonText: {
        type: String,
      },
    },
    ModalB: {
      Heading: {
        type: String,
      },
      CancelButtonText: {
        type: String,
      },
      CancelButtonColor: {
        type: String,
      },
    },
    Modal2: {
      Heading: {
        type: String,
      },
      SubmitButtonText: {
        type: String,
      },
      SubmitButtonColor: {
        type: String,
      },
      CancelButtonText: {
        type: String,
      },
      CancelButtonColor: {
        type: String,
      },
    },
    Modal3: {
      Heading: {
        type: String,
      },
      SubmitButtonText: {
        type: String,
      },
      SubmitButtonColor: {
        type: String,
      },
      CancelButtonText: {
        type: String,
      },
      CancelButtonColor: {
        type: String,
      },
    },
    RedeemButton: {
      ButtonColor: {
        type: String,
      },
      ButtonText: {
        type: String,
        default: "Redeem Points",
      },
      DomSelector: {
        type: String,
      },
    },
    CustomCss: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Store = mongoose.model("Store", storeSchema);
