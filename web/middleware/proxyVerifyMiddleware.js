import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import { Store } from "../model/store.model.js";
const secret = process.env.SHOPIFY_API_SECRET;

const verify = async function (req, res, next) {
  console.log("verify middlware start")
  // console.log("Request is there ----------------------- ",req.headers);
  console.log("Request body ",req.body);
  console.log(req.query.shop, "Req --- ", req.query.shop ? true : false);
  if (req.query.shop) {
    console.log("It have shop  in query ");
    console.log("It have shop  in query ");
    console.log(req.query);
    if (!req.query.signature) {
      return res.sendStatus(403);
    }
    //console.log(ctx.query);
    const signature = req.query.signature;
    const sharedSecret = process.env.SHOPIFY_API_SECRET;
    // console.log("sharedSecret", sharedSecret);
    const def = req.query;
    delete def.signature;
    const sortedQuery = Object.keys(def)
      .map((key) => `${key}=${Array(def[key]).join(",")}`)
      .sort()
      .join("");

    // console.log("sortedQuery",sortedQuery);

    const calculatedSignature = crypto
      .createHmac("sha256", sharedSecret)
      .update(sortedQuery)
      .digest("hex");

    // console.log('***********************************8 calculatedSignature',calculatedSignature)
    // console.log('***********************************8 signature', signature)
    // const isOriginatedFromBata = (ctx.request.header['origin'] == 'https://www.batabd.com')
    // console.log('*********************************** isOriginatedFromBata', isOriginatedFromBata)
    console.log(calculatedSignature, signature);
    if (calculatedSignature === signature) {
      console.log("validated");
      return next();
    }
    console.log("UnAuthorised Request");
    return next();
  }
  else if (!hasValidJWT(req, res, next)) {
    console.log("verify middlware end with hasValidJWT");
    return next();
  }
  else if (!(await postManVaildJwt(req, res, next))) {
    console.log("verify middlware end with postManVaildJwt");
    return next();
  } else {
    console.log("UnAuthorised Request last else");
    return next();
  }
};

const hasValidJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, `${secret}`);
    let shop = req.query.shop = decoded.dest.split("https://")[1]
    if (!shop) return false

    // console.log("decoded=", decoded)
    if (decoded) return true;
    else return false;
  } catch (e) {
    console.log("err in hasVaildJWT", e);
    return false;
  }
};

const postManVaildJwt = async (req, res, next) => {
  console.log("postManVaildJWT");
  const token = req.headers["authorization"]?.split("Bearer ")[1];
  console.log("token", token);
  // console.log("req.body.StoreName ",req.body);
  if (!token) return false;

  const shop = req.body.url;
  console.log("shop ",shop);
  const storeDetails = await Store.findOne({ StoreName: shop });
  console.log("+++++++= storeDetails customeToken =++++++++++", storeDetails?.AccessToken);
  const secretToken = storeDetails?.AccessToken;

  try {
    const decoded = jwt.verify(token, secretToken);
    console.log("decoded )))))))))))))))))) ",decoded);
    if (decoded) return true;
    else return false;
  } catch (err) {
    console.log("postManValidJWT err :::", err);
    return false;
  }
};

export const logesMiddleware = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data) {
      return "Please provide the data";
    }

  }
  catch (err) {
    return err.message;
  }
}
export default verify;
