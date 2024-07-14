import * as mongoose from "mongoose";

const Session = new mongoose.Schema(
    {
        id: String,
        shop: String,
        state: String,
        isOnline: String,
        scope: String,
        accessToken: String
    },
    { timestamps: true }
);

export const SessionSchema = mongoose.model("shopify_sessions", Session);

