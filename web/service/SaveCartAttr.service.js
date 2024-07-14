import { CartAttr } from "../model/attribute.model.js";
import { isEmpty } from "../utils/utility.js";

export const saveCartAttribute = async (req) => {
  const data = req.body;
  const store = data.StoreName ? data.StoreName : "";

  if (isEmpty(store)) {
    return {
      ReturnCode: "786",
      ReturnMessage:
        "Empty StoreName. Please Provide The StoreName in request body",
    };
  }

  try {
    console.log("dddddddddddddddddddddddddddddddddddddd", data);
    const isCartAttr = await CartAttr.findOne({
      $and: [{ checkoutToken: data?.checkoutToken }, { StoreName: store }],
    });

    console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu", isCartAttr);
    if (isCartAttr)
      return {
        ReturnCode: 2,
        ReturnMessage: "Attribute Already Exist",
      };
    const createdCartAttr = await CartAttr.create({
      StoreName: store,
      ...data,
    });
    console.log(
      "ddddcreatedCartAttrcreatedCartAttrdddddddddddddddddddddddddddddddddd",
      createdCartAttr
    );

    if (!createdCartAttr)
      return {
        ReturnCode: 1,
        ReturnMessage: "Something went wrong",
      };
    return { ReturnCode: 0, ...createdCartAttr._doc };
  } catch (error) {
    return {
      ReturnCode: 1,
      ReturnMessage:
        "Something went wrong ! Error in Save Cart Attribute: " +
          error.message || "",
    };
  }
};

export const updateCartAttribute = async (req) => {
  const data = req.body;
  const store = data.StoreName ? data.StoreName : "";
  try {
    if (isEmpty(store)) {
      return {
        ReturnCode: "786",
        ReturnMessage:
          "Empty StoreName. Please Provide The StoreName in request body",
      };
    }

    //checking the CartAttr if not then creating before update
    const isCartAttr = await CartAttr.findOne({
      $and: [{ checkoutToken: data?.checkoutToken }, { StoreName: store }],
    });
    let userPoint;
    if (!isCartAttr) {
      console.log("isCartAttr not find in updateCartAttribut");
      const cartData = await saveCartAttribute(req);
      console.log("+++++++cartData+++++++++============== ",cartData)
      userPoint = cartData?.points;
    }
    console.log("userPoint by Pankaj  =+++++====++++===+++===>  ", userPoint);
    const updateObject = {};
    updateObject.checkoutToken = data.checkoutToken;
    data.points ? (updateObject.points = data.points) : "";
    data.coupon ? (updateObject.coupon = data.coupon) : "";
    console.log("===>>> updateObject updateObject", updateObject);

    const updatedCartAttr = await CartAttr.findOneAndUpdate(
      { $and: [{ checkoutToken: data.checkoutToken }, { StoreName: store }] },
      { $set: { ...updateObject } },
      { new: true }
    );

    /* 
    old
    const updatedCartAttr = await CartAttr.findOneAndUpdate(
      { checkoutToken: data.checkoutToken },
      updateObject,
      { new: true }
    ); */
    console.log(
      "updatedCartAttr updatedCartAttr 00000000000===>>> updatedCartAttr updatedCartAttr",
      updatedCartAttr
    );

    if (isEmpty(updatedCartAttr))
      return {
        ReturnCode: 1,
        ReturnMessage: "Something went wrong ! Cart Attribute Doesn't Exist",
      };
    return { ReturnCode: 0, ...updatedCartAttr };
  } catch (error) {
    return {
      ReturnCode: 1,
      ReturnMessage:
        "Something went wrong ! Error in Update Cart Attribute: " +
          error.message || "",
    };
  }
};
