
import express = require("express");
import authCtrl = require("./auth");
import * as passport from "passport";

export namespace Routes {
	export function auth(): express.Router {
		const router = express.Router();
		router.route("/login")
			.post(authCtrl.postLogin);

		router.route("/logout")
			.get(authCtrl.logout);

		router.route("/signup")
			.post(authCtrl.postSignup);

		router.route("/forgot")
			.get(authCtrl.getForgot)
			.post(authCtrl.postForgot);

		router.route("/reset/:token")
			.get(authCtrl.getReset)
			.post(authCtrl.postReset);


		router.route("/facebook")
			.get(passport.authenticate("facebook", { scope: ["email", "public_profile"] }));

		router.route("/facebook/callback")
			.get(passport.authenticate("facebook", { failureRedirect: "/login" }), authCtrl.facebookCallback);

		return router;
	}
}
