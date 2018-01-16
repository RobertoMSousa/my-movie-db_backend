
import * as async from "async";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { default as User, UserModel, AuthToken } from "../../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
const request = require("express-validator");

/*
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
	if (req.user) {
		return res.redirect("/");
	}
	res.render("account/login", {
		title: "Login"
	});
};


/*
 *POST /login
 *Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("password", "Password cannot be blank").notEmpty();
	req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		return res.redirect("/login");
	}

	passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
		if (err) { return next(err); }
		if (!user) {
			return res.redirect("/login");
		}
		req.logIn(user, (err) => {
			if (err) { return next(err); }
			res.redirect(req.session.returnTo || "/");
		});
	})(req, res, next);
};



/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
	req.logout();
	res.redirect("/");
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
	if (req.user) {
		return res.redirect("/");
	}
	res.render("account/signup", {
		title: "Create Account"
	});
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = (req: Request, res: Response, next: NextFunction) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
	req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
	req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		return res.redirect("/signup");
	}

	const user = new User({
		email: req.body.email,
		password: req.body.password
	});

	User.findOne({ email: req.body.email }, (err, existingUser) => {
		if (err) { return next(err); }
		if (existingUser) {
			return res.redirect("/signup");
		}
		user.save((err) => {
			if (err) { return next(err); }
			req.logIn(user, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect("/");
			});
		});
	});
};


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = (req: Request, res: Response, next: NextFunction) => {
	req.assert("email", "Please enter a valid email address.").isEmail();
	req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		return res.redirect("/forgot");
	}

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
	req.assert("password", "Password must be at least 4 characters long.").len({ min: 4 });
	req.assert("confirm", "Passwords must match.").equals(req.body.password);

	const errors = req.validationErrors();

	if (errors) {
		return res.redirect("back");
	}

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