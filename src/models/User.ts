import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";
import { debug } from "util";



/*
TYPES
*/
export type UserModel = mongoose.Document & {
	email: string,
	password: string,
	passwordResetToken: string,
	passwordResetExpires: Date,
	facebook: string,
	tokens: AuthToken[],
	profile: {
		name: string,
		gender: string,
		location: string,
		website: string,
		picture: string
	},
	comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void,
	avatar: string;
	gravatar: string;
};

export type AuthToken = {
	accessToken: string,
	kind: string
};

export type saltedUser = {
	_id: mongoose.Types.ObjectId,
	email: string,
	avatar: string,
	gravatar: string
};

/*Mongo Schema*/
const userSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	password: {
		type: String,
		required: true
	},
	confirmed: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	deleted: {
		type: Boolean,
		default: false
	},
	deletedDate: {
		type: Date
	},
	facebook: {
		type: String
	},
	tokens: Array,
	profile: {
		name: String,
		gender: String,
		location: String,
		website: String,
		picture: String
	},
	passwordReset: {
		Token: String,
		Expires: Date
	},
	gravatar: {
		type: String,
		required: true
	}
});

/*
function that salt the user to avoid returning the sensive data
*/
export function userSalt(user: UserModel): saltedUser {
	return {_id: user._id, email: user.email, avatar: user.avatar, gravatar: user.gravatar};
}

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
	const user = this;
	if (!user.isModified("password")) { return next(); }
	bcrypt.genSalt(10, (err, salt) => {
		if (err) { return next(err); }
		bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
			if (err) { return next(err); }
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: any) => {}) {
	bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
		cb(err, isMatch);
	});
};


// /**
//  * Helper method for getting user's gravatar.
//  */
// userSchema.methods.gravatar = function (size: number) {
// 	if (!size) {
// 		size = 200;
// 	}
// 	if (!this.email) {
// 		return `https://gravatar.com/avatar/?s=${size}&d=retro`;
// 	}
// 	const md5 = crypto.createHash("md5").update(this.email).digest("hex");
// 	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
// };

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const User = mongoose.model("User", userSchema);
export default User;