const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

/**
 * Create Schema
 * Create a new instance of User model and set the values of the properties(fields)
 */
const UserSchema = new Schema( {
	userName: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	facebookUserId: {
		type: String
	},
	googleUserId: {
		type: String
	},
	registrationType: {
		type: String
	},
	picture: {
		type: String
	},
	phone: {
		type: String,
	},
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	country: {
		type: String,
	},
	referral: {
		type: String,
	},
	userComingFromUrl: {
		type: String,
	},
	type: {
		type: String,
	},
	subType: {
		type: String
	},
	emailVerified: {
		type: Boolean
	},
	emailVerificationExpiry: {
		type: String
	},
	status: {
		type: String
	},
	secretToken: {
		type: String
	},
	passwordResetToken: {
		type: String
	},
	lastLoginDateAndTime: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
} );

/**
 * Create a mongoose collection model for a collection name 'users', so that mongoose knows how to store data.
 * model() is used to create a new model, which takes the following args
 * first arg 'user', is the name of the collection
 * We pass the second property as model UserSchema created above,
 * which contains the properties/attributes that the 'user' collection will have.
 */
module.exports = User = mongoose.model( 'users', UserSchema );
