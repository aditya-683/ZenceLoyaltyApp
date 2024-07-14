import { Store } from "../model/store.model";

export const webhooksController = async (req) => {
  try {
    console.log(req.bpdy);
    // await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(
      `Webhook processed, returned status code 200000000000000000000000000000000000000000000`
    );
    const store = JSON.parse(req.rawBody).domain;
    const deleteStoreDetails = await Store.findOneAndDelete({
      StoreName: store,
    });
    return { status: 200 };
    console.log(
      " ########################################################## deleteStoreDetails => ",
      deleteStoreDetails
    );
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
};
