import * as crypto from "crypto";
import jwt from "jsonwebtoken";

const secret = process.env.SHOPIFY_API_SECRET
export const webhookValidation = async (req, res, next) => {
  console.log("webhook triggred");

  let digest = crypto
    .createHmac("SHA256", secret)
    .update(req.rawBody, "utf8", "hex")
    .digest("base64");
  //  console.log(ctx.request.rawBody);
  //  console.log("==============================================");
  //  console.log(digest);
  //  console.log("==============================================");
  //  console.log(ctx.request.headers["x-shopify-hmac-sha256"]);

  if (digest === req.headers["x-shopify-hmac-sha256"]) {
    // console.log("verified webhook", ctx.request);
    return next();
  } else {
    console.log("inside else");
    return (res.send({ msg: "Forbidden" }));
  }
};


export async function verifyjwt(req, res, next) {
  const token = req.headers['authorization'].split('Bearer ')[1]
  console.log("Token====", token)
  if (!token) return res.status(403)

  try {
    //  console.log("PROCESS ENV=", secret)
    const decoded = jwt.verify(token, `${secret}`);
    if (!decoded) return res.status(403)
    req.query.shop = decoded.dest.split("https://")[1]
    console.log("req.query.shop====================", req.query.shop)
    // console.log("decoded=", decoded)
    next()

  } catch (e) {
    console.log(e)
    res.status(400).json('Token not valid')
  }
}


export const AssignShopInReqFromToken = async (req, res, next) => {
  try {
    const token = req?.headers['authorization']?.split('Bearer ')[1]
    if (token) {
      const decoded = jwt.verify(token, `${secret}`);
      if (decoded) req.query.shop = decoded.dest.split("https://")[1]
    }
    next()
  } catch (error) {
    console.log(error)
  }
}