import { Store } from "../model/store.model";

export const uninstallAppWebhooksService = async (req) => {
    try {
        console.log(req);
        console.log(
          `Webhook processed, returned status code 200000000000000000000000000000000000000000000`
        );
        const store = JSON.parse(req.rawBody).domain;
        const deleteStoreDetails = await Store.findOneAndDelete({
          StoreName: store,
        });
        console.log(
          " ########################################################## deleteStoreDetails => ",
          deleteStoreDetails
        );
        res.status(200)
        
      } catch (error) {
        console.log(`Failed to process webhook: ${error}`);
      }
};