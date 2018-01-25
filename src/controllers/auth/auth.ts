

import * as async from "async";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { isEmail } from "validator";
import { each } from "async";
import { Error } from "mongoose";
import * as moment from "moment";

// mode
import { default as User, UserModel, AuthToken } from "../../models/User";



/*
 *POST /login
 *Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {

	if (!req.body.email) {
		res.status(403).json({message: "no email provided", error: undefined, data: undefined});
		return;
	}

	if (!isEmail(req.body.email)) {
		res.status(406).json({message: "email not valid", err: undefined, data: undefined});
		return;
	}

	if (!req.body.password) {
		res.status(403).json({message: "no password provided", error: undefined, data: undefined});
		return;
	}

	passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
		if (err) {
			res.status(500).json({message: undefined, error: err.message, data: undefined});
			return;
		}
		if (!user) {
			res.status(404).json({message: "email or password are wrong", error: undefined, data: undefined});
			return;
		}
		req.logIn(user, (err: Error) => {
			if (err) {
				res.status(500).json({message: undefined, error: err.message, data: undefined});
				return;
			}
			res.status(200).json({message: "login with success", error: undefined, data: undefined});
			return;
		});
	})(req, res, next);
};



/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
	req.logout();
	res.status(200).json({message: "logout success", error: undefined, data: undefined});
	return;
	// res.redirect("/");
};

/**
 * POST /signup
 * Create a new local account
 * Params:
 * email -> string
 * password -> string
 * passwordRepeated -> string
 */
export const postSignup = (req: Request, res: Response, next: NextFunction) => {

	if (!req.body.email) {
		res.status(403).json({message: "no email provided", error: undefined, data: undefined});
		return;
	}
	if (!isEmail(req.body.email)) {
		res.status(500).json({message: "email not valid", error: undefined, data: undefined});
		return;
	}
	if (!req.body.password || !req.body.passwordRepeated) {
		res.status(403).json({message: "no password provided", error: undefined, data: undefined});
		return;
	}
	if (req.body.password !== req.body.passwordRepeated) {
		res.status(500).json({message: "passwords don't match", error: undefined, data: undefined});
		return;
	}

	const user = new User({
		email: req.body.email,
		password: req.body.password
	});

	console.log("user-->", user); // roberto

	User.findOne({ email: req.body.email }, (err: Error, existingUser) => {
		if (err) {
			return next(err);
		}
		if (existingUser) {
			res.status(302).json({message: "user already exist", error: undefined, data: undefined});
			return;
		}
		user.save((err) => {
			if (err) {
				return next(err);
			}
			req.logIn(user, (err: Error) => {
				if (err) {
					res.status(500).json({message: undefined, error: err.message, data: undefined});
					return;
				}
				res.status(200).json({message: "account created", error: undefined, data: undefined});
				return;
			});
		});
	});
};


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = (req: Request, res: Response, next: NextFunction) => {

	/*
	TODO: check the params
	*/

	async.waterfall([
		function createRandomToken(done: Function) {
			crypto.randomBytes(16, (err, buf) => {
				const token = buf.toString("hex");
				done(err, token);
			});
		},
		function setRandomToken(token: AuthToken, done: Function) {
			User.findOne({ email: req.body.email }, (err, user: any) => {
				if (err) { return done(err); }
				if (!user) {
					return res.redirect("/forgot");
				}
				user.passwordResetToken = token;
				user.passwordResetExpires = Date.now() + 3600000; // 1 hour
				user.save((err: WriteError) => {
					done(err, token, user);
				});
			});
		},
		function sendForgotPasswordEmail(token: AuthToken, user: UserModel, done: Function) {
			const transporter = nodemailer.createTransport({
				service: "SendGrid",
				auth: {
					user: process.env.SENDGRID_USER,
					pass: process.env.SENDGRID_PASSWORD
				}
			});
			const mailOptions = {
				to: user.email,
				from: "hackathon@starter.com",
				subject: "Reset your password on Hackathon Starter",
				text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
					Please click on the following link, or paste this into your browser to complete the process:\n\n
					http://${req.headers.host}/reset/${token}\n\n
					If you did not request this, please ignore this email and your password will remain unchanged.\n`
			};
			transporter.sendMail(mailOptions, (err) => {
				done(err);
			});
		}
	], (err) => {
		if (err) { return next(err); }
		res.redirect("/forgot");
	});
};

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req: Request, res: Response) => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	res.render("account/forgot", {
		title: "Forgot Password"
	});
};


/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = (req: Request, res: Response, next: NextFunction) => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	User
		.findOne({ passwordResetToken: req.params.token })
		.where("passwordResetExpires").gt(Date.now())
		.exec((err, user) => {
			if (err) { return next(err); }
			if (!user) {
				return res.redirect("/forgot");
			}
			res.render("account/reset", {
				title: "Password Reset"
			});
		});
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = (req: Request, res: Response, next: NextFunction) => {

	/*
	TODO: check the req params
	*/

	async.waterfall([
		function resetPassword(done: Function) {
			User
				.findOne({ passwordResetToken: req.params.token })
				.where("passwordResetExpires").gt(Date.now())
				.exec((err, user: any) => {
					if (err) { return next(err); }
					if (!user) {
						return res.redirect("back");
					}
					user.password = req.body.password;
					user.passwordResetToken = undefined;
					user.passwordResetExpires = undefined;
					user.save((err: WriteError) => {
						if (err) { return next(err); }
						req.logIn(user, (err) => {
							done(err, user);
						});
					});
				});
		},
		function sendResetPasswordEmail(user: UserModel, done: Function) {
			const transporter = nodemailer.createTransport({
				service: "SendGrid",
				auth: {
					user: process.env.SENDGRID_USER,
					pass: process.env.SENDGRID_PASSWORD
				}
			});
			const mailOptions = {
				to: user.email,
				from: "express-ts@starter.com",
				subject: "Your password has been changed",
				text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
			};
			transporter.sendMail(mailOptions, (err) => {
				done(err);
			});
		}
	], (err) => {
		if (err) { return next(err); }
		res.redirect("/");
	});
};




/**
 * GET /facebook/calback
 * Process the facebook callback
 */
export const facebookCallback = (req: Request, res: Response) => {
	res.redirect(req.session.returnTo || "/");
	return;
};