import * as request from "supertest";
import * as app from "../src/app";
import * as mongo from "connect-mongo";

import { default as User, UserModel, AuthToken } from "../src/models/User";
import { Error } from "mongoose";

const chai = require("chai");
const expect = chai.expect;

describe("Test the login route", () => {

	beforeEach(() => {
		console.log(""); // roberto
	});

	it("should return 206 and the no email provided message", (done) => {

		request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("no email provided");
				done();
				return;
			});
	});

	it("should return 206 and the no not valid email messge", (done) => {
		request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({
				email: "notvalid"
			})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("email not valid");
				done();
				return;
			});
	});

	it("should return 206 and the no password provided message", (done) => {
		request(app)
			.post("/auth/login")
			.send({
				email: "beto@mail.com"
			})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("no password provided");
				done();
				return;
			});
	});

	it("should get the email or password wrong error", (done) => {
		request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({
				"email": "notfound@mail.local",
				"password": "123"
			})
			.expect(404)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("email or password are wrong");
				done();
				return;
			});
	});

	it("should bet able to get success message on login", (done) => {
		request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({
				"email": "placeholder@mail.com",
				"password": "123"
			})
			.expect(200)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("login with success");
				done();
				return;
			});
	});

});

describe("Test the login route", () => {
	it("should bet able to login and logout right after", (done) => {
		request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({
				"email": "placeholder@mail.com",
				"password": "123"
			})
			.expect(200)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("login with success");
				request(app).get("/auth/logout")
					.set("Accept", "application/json")
					.expect(200)
					.expect("Content-Type", /json/)
					.end(function (err, res) {
						if (err) {
							done(err);
							return;
						}
						chai.expect(res.body.message).to.equal("logout success");
						done();
						return;
					});§
			});
	});
});

describe.skip("GET /auth/signup", () => {
	it("should return 403 and the no email provided message", (done) => {
		console.log("sample"); // roberto
		request(app).post("/auth/signup")
			.set("Accept", "application/json")
			.send({})
			.expect(403)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("no email provided");
				done();
				return;
			});
	});

	it("should return 500 and the not valid email message", (done) => {
		console.log("sample"); // roberto
		request(app).post("/auth/signup")
			.set("Accept", "application/json")
			.send({
				"email": "noValid"
			})
			.expect(500)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("email not valid");
				done();
				return;
			});
	});

	it("should return 403 if not password provided", (done) => {
		console.log("sample"); // roberto
		request(app).post("/auth/signup")
			.set("Accept", "application/json")
			.send({
				"email": "beto@mail.com",
				"passwordRepeat": "123"
			})
			.expect(403)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("no password provided");
				done();
				return;
			});
	});

	it("should return 403 if not reapeated password provided provided", (done) => {
		console.log("sample"); // roberto
		request(app).post("/auth/signup")
			.set("Accept", "application/json")
			.send({
				"email": "beto@mail.com",
				"password": "123"
			})
			.expect(403)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("no password provided");
				done();
				return;
			});
	});


	it("should return 500 if not password and repeated password don't match", (done) => {
		console.log("sample"); // roberto
		request(app).post("/auth/signup")
			.set("Accept", "application/json")
			.send({
				"email": "beto@mail.com",
				"password": "123",
				"passwordRepeated": "notequal"
			})
			.expect(500)
			.expect("Content-Type", /json/)
			.end(function (err, res) {
				if (err) {
					done(err);
					return;
				}
				console.log("res-->", res.body); // roberto
				chai.expect(res.body.message).to.equal("passwords don't match");
				done();
				return;
			});
	});
});


// describe("POST /login", () => {
// 	it("should return some defined error message with valid parameters", (done) => {
// 		return request(app).post("/auth/login")
// 			.field("email", "john@me.com")
// 			.field("password", "Hunter2")
// 			.expect(302)
// 			.end(function(err, res) {
// 				expect(res.error).not.to.be.undefined;
// 				done();
// 			});
// 	});
// });