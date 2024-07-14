import * as mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema(
    {
        shop: {
            type: String,
            default: ""
        },
        sessionId: {
            type: String,
        },
        id: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        isOnline: {
            type: Boolean,

        },
        expires: {
            type: Date,
        },
        scope: {
            type: String,
        },
        accessToken: {
            type: String,
            default: ""
        },
        onlineAccessInfo: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

export const SessionStore = mongoose.model("SessionStore", sessionSchema);


