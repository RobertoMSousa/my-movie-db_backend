
import express = require("express");
import UserCtrl = require("./home");

export namespace Routes {
	export function home(): express.Router {
		const router = express.Router();
		router.route("/")
			.get(UserCtrl.index);

		return router;
	}
}
