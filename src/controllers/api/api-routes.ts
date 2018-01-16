
import express = require("express");
import apiController = require("../api/api");

import passportConfig = require("../../config/passport");

export namespace Routes {
	export function api(): express.Router {
		const router = express.Router();
		router.route("/")
			.get(apiController.getApi);

		router.route("/facebook")
			.get(passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

		return router;
	}
}
