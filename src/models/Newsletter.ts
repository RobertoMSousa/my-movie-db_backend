
import * as mongoose from "mongoose";

export type NewsletterModel = mongoose.Document & {
	email: string,
};

const newsLetterSchema = new mongoose.Schema({
	email: { type: String, unique: true }
}, { timestamps: true });


export const Newsletter = mongoose.model("Newsletter", newsLetterSchema);

// export default Newsletter;