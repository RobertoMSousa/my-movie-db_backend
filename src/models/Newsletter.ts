
import * as mongoose from "mongoose";

export type NewsletterModel = mongoose.Document & {
	email: string,
};

const newsLetterSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	confirmed: {type: Boolean, default: false, unique: false}
}, { timestamps: true });


export const Newsletter = mongoose.model("Newsletter", newsLetterSchema);