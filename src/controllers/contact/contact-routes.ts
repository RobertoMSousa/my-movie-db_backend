import express = require("express");
import contactCtrl = require("./contact");

export namespace Routes {
	export function contact(): express.Router {
		const router = express.Router();
		router.route("/")
			.get(contactCtrl.getContact)
			.post(contactCtrl.postContact);


		return router;
	}
}