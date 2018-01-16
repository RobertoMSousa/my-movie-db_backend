import express = require("express");
import userCtrl = require("./user");

import passportConfig = require("../../config/passport");

export namespace Routes {
	export function index(): express.Router {
		const router = express.Router();
		router.route("/account")
			.get(passportConfig.isAuthenticated, userCtrl.getAccount);

		router.route("/account/delete")
			.post(passportConfig.isAuthenticated, userCtrl.postDeleteAccount);

		router.route("/account/unlink/:provider")
			.get(passportConfig.isAuthenticated, userCtrl.getOauthUnlink);

		router.route("/account/profile")
			.post(passportConfig.isAuthenticated, userCtrl.postUpdateProfile);

		router.route("/account/password")
			.post(passportConfig.isAuthenticated, userCtrl.postUpdatePassword);


		return router;
	}
}