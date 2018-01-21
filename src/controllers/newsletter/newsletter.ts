import * as async from "async";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { default as User, UserModel, AuthToken } from "../../models/User";
import { Newsletter, NewsletterModel } from "../../models/Newsletter";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { concat } from "async";
import { isEmail } from "validator";


const smtpTransport: any = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAILPASS
	}
});

const host: string = process.env.BACKEND_SERVER_URL;




/**
 * POST /newsletter
 * subscribe to the newsletter
 */
export const postSubmitNewletter = (req: Request, res: Response) => {
	if (!req.body.email) {
		res.json({status: 405, message: "no email provided", data: ""});
		return;
	}
	if (!isEmail(req.body.email)) {
		res.json({status: 406, message: "email not valid", data: ""});
		return;
	}
	const email: string = req.body.email.toLowerCase();
	Newsletter.create({"email": email, confirmed: false}, (err: WriteError, docs: NewsletterModel) => {
		if (err) {
			if (err.code === 11000) {
				res.json({status: 200, message: "email already on the DB", error: undefined, data: undefined});
				return;
			}
		}


		const link = host + "/newsletter/confirm?id=" + docs._id;
		const mailOptions = {
			to : email,
			subject : "Please confirm your Email account",
			html : "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
		};

		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
				res.end("error");
			} else {
				res.json({status: 200, message: "subscribed email", error: undefined, data: undefined});
				return;
			}
		});
	});
};



/**
 * GET /newsletter/confirm?id=
 * confirm the user email to the news letter
 */
export const confirmEmailNewsletter = (req: Request, res: Response) => {
	if (!req.query.id) {
		res.status(405).json({message: "missing the id", error: undefined, data: undefined});
		return;
	}
	Newsletter.findByIdAndUpdate(req.query.id, {confirmed: true}, (err: Error, doc: NewsletterModel) => {
		if (err) {
			res.status(500).json({message: undefined, error: err.message, data: undefined});
			return;
		}
		if (!doc) {
			res.status(404).json({message: "email not found", error: undefined, data: undefined});
			return;
		}
		const mailOptions = {
			to : doc.email,
			subject : "Thank you for confirming",
			html : "Thank you!"
		};
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
				res.end("error");
			} else {
				res.status(200).json({message: "confirmed email", error: undefined, data: undefined});
				return;
			}
		});
	});
};



/**
 * DELETE /newsletter
 * subscribe to the newsletter
 */
export const deleteNewletter = (req: Request, res: Response) => {
	if (!req.body.email) {
		res.json({status: 405, message: "no email provided", data: ""});
		return;
	}
	if (!isEmail(req.body.email)) {
		res.json({status: 406, message: "email not valid", data: ""});
		return;
	}
	Newsletter.deleteOne({email: req.body.email.toLowerCase()}, (err: Error) => {
		if (err) {
			res.json({status: 503, message: "", err: err, data: ""});
			return;
		}
		res.json({status: 200, message: "sucessfull delete the email from newsletter", data: ""});
	return;
	});
};