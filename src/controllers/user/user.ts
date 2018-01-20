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


/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
	res.status(200).json({message: "this should be only workign if logged in", error: undefined, data: undefined});
	return;
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {

	/*
	TODO: check the params
	*/

	User.findById(req.user.id, (err, user: UserModel) => {
		if (err) { return next(err); }
		user.email = req.body.email || "";
		user.profile.name = req.body.name || "";
		user.profile.gender = req.body.gender || "";
		user.profile.location = req.body.location || "";
		user.profile.website = req.body.website || "";
		user.save((err: WriteError) => {
			if (err) {
				if (err.code === 11000) {
					return res.redirect("/user/account");
				}
				return next(err);
			}
			res.redirect("/user/account");
		});
	});
};

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {

	/*
	TODO: check the params
	*/

	User.findById(req.user.id, (err, user: UserModel) => {
		if (err) { return next(err); }
		user.password = req.body.password;
		user.save((err: WriteError) => {
			if (err) { return next(err); }
			res.redirect("/user/account");
		});
	});
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
	User.remove({ _id: req.user.id }, (err) => {
		if (err) { return next(err); }
		req.logout();
		res.redirect("/");
	});
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
	const provider = req.params.provider;
	User.findById(req.user.id, (err, user: any) => {
		if (err) { return next(err); }
		user[provider] = undefined;
		user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
		user.save((err: WriteError) => {
			if (err) { return next(err); }
			res.redirect("/user/account");
		});
	});
};



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
	Newsletter.create({"email": req.body.email.toLowerCase(), confirmed: false}, (err: WriteError) => {
		if (err) {
			if (err.code === 11000) {
				res.json({status: 200, message: "email already on the DB", error: undefined, data: undefined});
				return;
			}
		}
		res.json({status: 200, message: "subscribed email", error: undefined, data: undefined});
		return;
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