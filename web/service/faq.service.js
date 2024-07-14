import { Faq } from "../model/faq.modal.js";

export const postFaqService = async (req) => {
  const data = req.body;
  // console.log("req body",data);
  if (!req.body.question || !req.body.answer) {
    return {
      data: "Please provide the data"
    }
  }
  try {
    const postData = await Faq.insertMany([data]);
    console.log("post Data in Faq", postData);
    return {
      data: postData,
    };
  } catch (err) {
    return {
      error: err,
      message: "Internal Server error",
    };
  }
};

export const getFaqService = async (req) => {
  try {
    const allFaqData = await Faq.find();
    return {
      data: allFaqData,
    };
  } catch (err) {
    return {
      error: err,
      message: "Internal Server error",
    };
  }
};
