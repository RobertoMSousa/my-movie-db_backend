import * as request from "supertest";
import * as app from "../src/app";

const chai = require("chai");
const expect = chai.expect;

describe("Test the login route", () => {

	it("should return 206 and the no email provided message", (done) => {
		console.log("sample"); // roberto
		return request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function(err, res) {
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
		return request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({email: "notvalid"})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function(err, res) {
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

	it.only("should return 206 and the no password provided message", (done) => {
		return request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({"email": "john@me.local"})
			.expect(206)
			.expect("Content-Type", /json/)
			.end(function(err, res) {
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
		return request(app).post("/auth/login")
			.set("Accept", "application/json")
			.send({"email": "john@me.local", "password": "123"})
			.expect(404)
			.expect("Content-Type", /json/)
			.end(function(err, res) {
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

});

// describe("GET /auth/signup", () => {
// 	it("should return 200 OK", () => {
// 		return request(app).get("/auth/signup")
// 			.expect(200);
// 	});
// });


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
