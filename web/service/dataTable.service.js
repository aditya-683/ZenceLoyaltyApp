import { CartAttr } from "../model/attribute.model.js";
import { isEmpty } from "../utils/utility.js";

const getAllCartAttributes = async (req) => {
  try {
    const count = req.query.count;
    const skip = req.query.skip;
    const store = req.query?.StoreName || req.query.shop;
    let cartAttrs;
    if (!isEmpty(store)) {
      cartAttrs = await CartAttr.aggregate([
        {
          $match: {
            StoreName: store,
            isDeleted: false
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: Number(skip),
        },

        {
          $limit: Number(count),
        },
      ]);
    } else {
      cartAttrs = await CartAttr.aggregate([
        {
          $match: {
            isDeleted: false
          },
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: Number(skip),
        },

        {
          $limit: Number(count),
        },
      ]);
    }
    return {
      count: count,
      data: cartAttrs,
    };
  } catch (error) {
    console.log(error);
    return {
      code: error.status || 500,
      message: error.message || "something went wrong!",
    };
  }
};

const getACartAttribute = async (req) => {
  try {
    const store = req.query?.store?.trim() || req.query.shop;
    const searchTerm = req.query.search.trim();

    const count = req.query.count.trim();
    const skip = req.query.skip.trim();

    console.log("search=" + searchTerm, "count = " + count, "skip=" + skip);
    let regex = /^[A-Z]/; //rgex to check if the string starts with Capitalized alphabets

    /*
    if the orderName contains some alphabets(caps) then orderName will be the searchTerm
    but if it is number in string and doesn't have prefix as '#' then order name will #21462 
    instead of 21462.

    Eg: `SWT1234` will remain same `SWT1234` but if searchTerm is `1234` then
    it will be changed to `#1234`
    */
    const toBeSearchedOrdeName = regex.test(searchTerm)
      ? searchTerm
      : `${!searchTerm.includes("#") ? `#${searchTerm}` : searchTerm}`;

    let mongoQuery;

    if (isEmpty(store)) {
      mongoQuery = {
        $match: {
          isDeleted: false,
          $or: [
            {
              orderName: `${toBeSearchedOrdeName}`,
            },
            {
              orderId: `${searchTerm}`,
            },
            {
              checkoutToken: `${searchTerm}`,
            },
            {
              phone: `${searchTerm}`,
            },
          ],
        },
      };
    } else {
      mongoQuery = {
        $match: {
          $and: [
            { StoreName: store },
            { isDeleted: false, },
            {
              $or: [
                {
                  orderName: `${toBeSearchedOrdeName}`,
                },
                {
                  orderId: `${searchTerm}`,
                },
                {
                  checkoutToken: `${searchTerm}`,
                },
                {
                  phone: `${searchTerm}`,
                },
              ],
            },
          ],
        },
      };
    }

    const cartAttrs = await CartAttr.aggregate([
      mongoQuery,
      {
        $skip: Number(skip ? skip : 0),
      },

      {
        $limit: Number(count ? count : 20),
      },
    ]);

    return {
      count: count,
      data: cartAttrs,
    };
  } catch (error) {
    console.log(error);
    return {
      code: error.status || 500,
      message: error.message || "something went wrong!",
    };
  }
};

export { getACartAttribute, getAllCartAttributes };