import express = require("express");
import newsletterCtrl = require("./newsletter");


export namespace Routes {
	export function index(): express.Router {
		const router = express.Router();

		router.route("/")
			.post(newsletterCtrl.postSubmitNewletter)
			.delete(newsletterCtrl.deleteNewletter);

		router.route("/confirm")
			.get(newsletterCtrl.confirmEmailNewsletter);

		return router;
	}
}