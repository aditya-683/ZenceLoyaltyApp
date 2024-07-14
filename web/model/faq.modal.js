import mongoose from "mongoose";
const faqSchema = new mongoose.Schema({
    question: {
        type: String
    },
    answer: {
        type: String
    },
    answerImage: {
        type: String
    },
    answerLink: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Faq = mongoose.model("faq", faqSchema);