import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { Store } from "../model/store.model.js";
dotenv.config();

export const generateTokenService = async (req) => {
  const reqBody = req.body;
  try {
    const store = await Store.findOne({
      StoreName: reqBody?.StoreName,
    });

    const randomString = generate64BitRandomString();
    console.log("randomString :::", randomString);
    const token = await jwt.sign(
      { erKey: process.env.SHOPIFY_SHARED_SECRET },
      randomString
    );

    console.log("store?._id",store?._id);
    const updateTokenInDb = await Store.findByIdAndUpdate(store?._id, {
      $set: { customeToken: randomString, jwtToken: token },
    });
    console.log("updateTokenInDb :", updateTokenInDb);
    return {
      token,
    };
  } catch (err) {
    return {
      message: err.message,
      error: err,
    };
  }
};

function generate64BitRandomString() {
  const randomBuffer = crypto.randomBytes(8);
  const randomString = randomBuffer.toString("hex");
  return randomString;
}
