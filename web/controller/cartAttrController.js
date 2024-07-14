import {
  saveCartAttribute,
  updateCartAttribute,
} from "../service/SaveCartAttr.service.js";
import {
  getACartAttribute,
  getAllCartAttributes,
} from "../service/dataTable.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const saveCartAttributeController = CatchAsync(
  async (req, res, next) => {
    const saveCartAttributeData = await saveCartAttribute(req);
    return res.send(saveCartAttributeData);
  }
);

export const updateCartAttributeController = CatchAsync(
  async (req, res, next) => {
    const updateCartAttributeData = await updateCartAttribute(req);
    return res.send(updateCartAttributeData);
  }
);

export const getAllCartAttributesController = CatchAsync(
  async (req, res, next) => {
    const { code, message, data, count } = await getAllCartAttributes(req);
    return res.status(code || 200).send({ code, message, data, count });
  }
);

export const getACartAttributeController = CatchAsync(
  async (req, res, next) => {
    const { code, message, data, count } = await getACartAttribute(req);
    return res.status(code || 200).send({ code, message, data, count });
  }
);
