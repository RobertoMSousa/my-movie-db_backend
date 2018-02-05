import * as request from "supertest";
import * as app from "../src/app";
import * as mongoose from "mongoose";
import * as path from "path";
import * as dotenv from "dotenv";

import { default as User, UserModel, AuthToken } from "../src/models/User";

dotenv.config({ path: ".env" });

describe.only("test the server", () => {

	beforeAll(() => {
		console.log("before all"); // roberto
		// create the mongo user placeholder
		const user = new User({
			email: "placeholder@mail.com",
			password: "123"
		});
		user.save((err: Error, document) => {
			console.log("document-->", document); // roberto
			return;
		});
	});

	it("should be able to connect to the DB", (done) => {
		mongoose.connect(process.env.MONGODB_TEST_URL, (err: Error) => {
			if (err) {
				done(err);
				return;
			}
			done();
			return;
		});
	});
});
