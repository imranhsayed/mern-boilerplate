const express = require( 'express' );
const bcrypt = require( 'bcryptjs' );
const secretKey = require( '../../config/keys' ).secretOrKey;
const jwt = require( 'jsonwebtoken' );
const passport = require( 'passport' );
const randomstring = require( 'randomstring' );
const mailer = require( '../../misc/mailer' );


// Load user model.
const User = require( '../../models/User' );

/**
 * express.Router() creates modular, mountable route handlers
 * A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.
 */
const router = express.Router();

//csrf
const csrf = require('csurf');
let csrfProtection = csrf({ cookie: true });
router.use( csrfProtection );


/**
 * GET api/users/getCsrfToken
 *
 * private
 */
router.get('/', function  (req, res ) {
	res.json( 'test' )
});

/**
 * GET api/users/getCsrfToken
 *
 * public
 */
router.get('/getCsrfToken', csrfProtection, function  (req, res ) {
	res.json( req.csrfToken() );
});


// Load input validation
const validateRegisterInput = require( '../../validation/register' );
const validateLoginInput = require( '../../validation/login' );
const validateResetPasswordInput = require( '../../validation/resetPassword' );
const validateChangePassword = require('../../validation/changePassword');


/**
 * @route POST /api/users/verifyRegistrationEmail
 * @desc Verify the Email with token and update the database account status to be active. Also checks if the email verification token expiry date( 24hrs ).
 * @access public
 */
router.post( '/verifyRegistrationEmail', csrfProtection, ( req, res ) => {
	errors = {};
	User.findOne( { email: req.body.email } )
		.then( user => {

			// If user does not exists with this token
			if ( ! user ) {
				errors.token = 'Token invalid';
				return res.status( 400 ).json( { token: errors.token } );
			} else if ( 'active' === user.status ) {
				// If user has already been verified.
				errors.token = 'User has already been verified';
				return res.status( 400 ).json( { token: errors.token } );
			} else {

				// Check if the token value is correct

				if ( user.secretToken === req.body.token ) {

					let currentTime = Math.round((new Date()).getTime() / 1000);

					// Check if the verification email is expired
					if ( currentTime > user.emailVerificationExpiry  ) {

						errors.token = 'Verification Email is Expired';
						return res.status( 400 ).json( {token: errors.token} );
					} else {
						// Its Success. Update the database by changing the account status to active.
						const userFields = {};
						userFields.emailVerified = true;
						userFields.status = 'active';
						userFields.secretToken = '';

						User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
							.then( ( user ) => res.json( user ) )
							.catch( ( errors ) => res.json( errors ) );
					}
				} else {
					// Its invalid token
					errors.token = 'Invalid Token';
					return res.status( 400 ).json( { token: errors.token } );
				}
			}
		} )
		.catch( error => res.status(400).json( error ) );

});


/**
 * @route POST api/users/register
 * @desc Register user
 * @access public
 */
router.post( '/register', csrfProtection, ( req, res ) => {
	/**
	 * validateRegisterInput() defined in register.js returns an object with the property names errors and isValid,
	 * We are creating new variables 'errors' and 'isValid' for these properties using ES6 object destructuring.
	 */
	const { errors, isValid } = validateRegisterInput( req.body );

	// If validation fails then send the response 400 with errors object
	if ( ! isValid ) {
		return res.status( 400 ).json( errors );
	}

	/**
	 * findOne() find the document with the query passed as an object.
	 * We access the input elements by req.body.nameOfTheInput
	 */
	User.findOne( { email: req.body.email } )
		.then( ( user ) => {

			// If user exists then send a response as 400 with a message 'Email already exists'
			if ( user ) {
				errors.email = 'Email already exists';
				return res.status( 400 ).json( {email: errors.email} );
			}

			// Check for userName existence, if it exists then throw error
			User.findOne( { userName: req.body.userName } )
				.then( ( user ) => {
					if ( user ) {
						errors.userName = 'User Name' +
							' already exists';
						return res.status( 400 ).json( {userName: errors.userName} );
					} else {
						// If its a new user

						// Generate Random String to be sent for email
						let randString = randomstring.generate();

						// Set email verification expiry date to 24 hours later.
						let emailVerificationExpTime = Math.round((new Date()).getTime() / 1000) + ( 24 * 60 * 60 ),
							// @todo need to change this url to the client's url later.
							emailVrfRedirectUrl = 'http://localhost:3000/verifyEmail?email='+ req.body.email +'&token=' + randString;

						/**
						 * If the user does not already exists, create a new user using new User(),
						 * which takes an object containing the properties and values of the fields in the 'users' collections
						 */
						const newUser = new User({
							userName: req.body.userName,
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							registrationType: req.body.registrationType,
							picture: ( req.body.picture ) ? req.body.picture : '/Image/default-avatar.png',
							facebookUserId: ( req.body.facebookUserId ) ? req.body.facebookUserId : '',
							googleUserId: ( req.body.googleUserId ) ? req.body.googleUserId : '',
							email: req.body.email,
							country: req.body.country,
							referral: req.body.referral,
							password: req.body.password,
							type: 'user',
							subType: '',
							emailVerified: false,
							emailVerificationExpiry: emailVerificationExpTime,
							status: 'inactive',
							notificationIds: [],
							deletedNotificationsIds: [],
							readNotificationIds: [],
							userComingFromUrl: req.headers.referer,
							secretToken: '',
							lastLoginDateAndTime: '',
							points: 0
						});


						/**
						 * Generate Salt with bcrypt.genSalt() and then hash the password using bcrypt.hash()
						 */
						bcrypt.genSalt( 10, ( err, salt ) => {
							bcrypt.hash( newUser.password, salt, ( err, hash ) => {
								// If there is an error throw the error, otherwise set the newUser.password equal to hash created from bcrypt.hash()
								if ( err ) throw  err;
								newUser.password = hash;

								// Then save user in the database using newUser.save() and then send the user as response on success and error on failure.
								newUser.save()
									.then( ( user )  => {
										// Compose a mail
										const html = 'Hi ' + req.body.firstName + '!' +
											'<br>Thank you for registering with Coinrewarder' +
											'<br>Please verifiy your email on the below link to complete your registration process' +
											'<br>Your verification token is: <strong>' + randString + user._id + '</strong>' +
											'<br>Or you can directly click on the below link to verify' +
											'<br><a target="_blank" href="' + emailVrfRedirectUrl + user._id + '">' + emailVrfRedirectUrl + user._id + '</a>' +
											'<br>This verification email will be valid for 24 hours, post which you need to request a new verification email.' +
											'<br>Thanks,' +
											'<br>Coinrewarder';

										mailer.sendEmail(
											'"Coinrewarder" <Imran.Sayed@myrl.tech>', // from
											user.email, // to
											'Please verify your email', // sub
											html // body
										);

										// Update Secret Token in the new user created
										const userFields = {};
										userFields.secretToken = randString + user._id;
										User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
											.then( ( user ) => res.json( user ) )
											.catch( ( errors ) => res.json( errors ) );

										res.json( user )
									} )
									.catch( ( err ) => console.log( err ) )
							} );
						} );

					}
				} );
		} )
} );

/**
 * @route POST api/users/login
 * @desc Login User /
 * @access public
 */
router.post( '/login', csrfProtection, ( req, res ) => {

	/**
	 * validateRegisterInput() defined in register.js returns an object with the property names errors and isValid,
	 * We are creating new variables 'errors' and 'isValid' for these properties using ES6 object destructuring.
	 */
	const { errors, isValid } = validateLoginInput( req.body );


	// If validation fails then send the response 400 with errors object
	if ( ! isValid ) {
		return res.status( 400 ).json( errors );
	}

	const userNameOrEmail = req.body.userNameOrEmail;
	const password = req.body.loginPassword; // password return here is plain text hence we should use bycrypt.compare()


	// Find user by email. ( Down below { email } in ES6 is same as { email: email }
	User.findOne( { $or: [ { userName: userNameOrEmail}, { email: userNameOrEmail } ] } )
		.then( ( user ) => {

			// Check for user
			if ( ! user ) {
				errors.userNameOrEmail = 'User not found';
				return res.status( 404 ).json( errors );
			}

			// Throw error if the userNameOrEmail is not verified
			if ( ! user.emailVerified ) {
				errors.userNameOrEmail = 'Please verify your email first';
				return res.status( 404 ).json( errors );
			}

			/**
			 * If user found , check password,
			 * Note that the password available from req.body.password, is plain text hence
			 * we should use bycrypt.compare() which will take the plain text password 'req.body.password' as first param and
			 * hashed password 'user.password' as a second param and return true inside 'isMatch' variable if matched, false otherwise.
			 */
			bcrypt.compare( password, user.password )
				.then( ( isMatch ) => {
					// If the password matches isMatch will be true.
					if ( isMatch ) {
						// User found
						// res.json( { msg: 'Success' } );

						/**
						 * Create a jwt payload( actual data ) first containing user info to send to using jwt.sign()
						 * Since we have the user object available from then() promise callback, we can access all of its properties.
						 */
						const payload = {
							id: user.id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							country: user.country,
							registrationType: user.registrationType,
							picture: user.picture,
							referral: user.referral,
							emailVerified: user.emailVerified,
							type: user.type,
							lastLoginDateAndTime: user.lastLoginDateAndTime,
						};

						// Get current time stamp and save it as last login time
						const userField = {};
						userField.lastLoginDateAndTime = Math.round((new Date()).getTime() / 1000);

						// Save the last login data and time for this user.
						User.findOneAndUpdate( { email: user.email }, { $set: userField }, { new: true } )
							.then( ( user ) => console.log( 'logged in' ) )
							.catch( ( errors ) => res.json( errors ) );

						/**
						 * jwt.sign() takes the data passed in payload and signs it, creates a hash and returns a token value.
						 * It takes the payload data as the first param and the secret as the second and returns a token, which we will
						 * send to the user when they sign in or login.
						 * payload contains user info to be sent
						 * keys.secretOrKey is imported from config/keys.js which we can set to anything, which is sent for security
						 * expiresIn is in secs, which is when the token expires, then fourth param is the call back function.
						 */
						jwt.sign( payload, secretKey, { expiresIn: 3600 }, ( err, token ) => {
							res.json( { success: true, token: 'Bearer ' + token } );
						} );
					} else {
						errors.loginPassword = 'Password Incorrect';
						// If the password does not match
						return res.status( 400 ).json( errors );
					}
				} )
		} )
});

/**
 * @route POST api/users/loginViaFacebook
 * @desc Login User via Facebook/
 * @access public
 */
router.post( '/loginViaFacebook', csrfProtection, ( req, res ) => {

	const userEmail = req.body.email;
	const facebookUserId = req.body.facebookUserId;
	const errors = {};


	// Find user by email. ( Down below { email } in ES6 is same as { email: email }
	User.findOne( { email: userEmail } )
		.then( ( user ) => {

			// Check for user
			if ( ! user ) {
				errors.userNameOrEmail = 'User not found';
				return res.status( 404 ).json( errors );
			}

			// Throw error if the userNameOrEmail is not verified
			if ( ! user.emailVerified ) {
				errors.userNameOrEmail = 'Please verify your email first';
				return res.status( 404 ).json( errors );
			}
					// If the facebookUserId matches the one in the database for the user.
					if ( facebookUserId === user.facebookUserId ) {
						/**
						 * Create a jwt payload( actual data ) first containing user info to send to using jwt.sign()
						 * Since we have the user object available from then() promise callback, we can access all of its properties.
						 */
						const payload = {
							id: user.id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							country: user.country,
							registrationType: user.registrationType,
							picture: user.picture,
							referral: user.referral,
							emailVerified: user.emailVerified,
							type: user.type,
							lastLoginDateAndTime: user.lastLoginDateAndTime,
							points: ( user.points ).toFixed( 4 )
						};

						// Get current time stamp and save it as last login time
						const userField = {};
						userField.lastLoginDateAndTime = Math.round((new Date()).getTime() / 1000);

						// Save the last login data and time for this user.
						User.findOneAndUpdate( { email: user.email }, { $set: userField }, { new: true } )
							.then( ( user ) => console.log( 'user last login time updated' ) )
							.catch( ( errors ) => res.json( errors ) );

						/**
						 * jwt.sign() takes the data passed in payload and signs it, creates a hash and returns a token value.
						 * It takes the payload data as the first param and the secret as the second and returns a token, which we will
						 * send to the user when they sign in or login.
						 * payload contains user info to be sent
						 * keys.secretOrKey is imported from config/keys.js which we can set to anything, which is sent for security
						 * expiresIn is in secs, which is when the token expires, then fourth param is the call back function.
						 */
						jwt.sign( payload, secretKey, { expiresIn: 3600 }, ( err, token ) => {
							res.json( { success: true, token: 'Bearer ' + token } );
						} );
					} else {
						errors.userNameOrEmail = 'Login Failed';
						// If the password does not match
						return res.status( 400 ).json( errors );
					}
		} );
});

/**
 * @route POST api/users/loginViaGoogle
 * @desc Login User via Google/
 * @access public
 */
router.post( '/loginViaGoogle', csrfProtection, ( req, res ) => {

	const userEmail = req.body.email;
	const googleUserId = req.body.googleUserId;
	const errors = {};


	// Find user by email. ( Down below { email } in ES6 is same as { email: email }
	User.findOne( { email: userEmail } )
		.then( ( user ) => {

			// Check for user
			if ( ! user ) {
				errors.userNameOrEmail = 'User not found';
				return res.status( 404 ).json( errors );
			}

			// Throw error if the userNameOrEmail is not verified
			if ( ! user.emailVerified ) {
				errors.userNameOrEmail = 'Please verify your email first';
				return res.status( 404 ).json( errors );
			}
			console.log( req.body );
			// If the googleUserId matches the one in the database for the user.
			if ( googleUserId === user.googleUserId ) {
				/**
				 * Create a jwt payload( actual data ) first containing user info to send to using jwt.sign()
				 * Since we have the user object available from then() promise callback, we can access all of its properties.
				 */
				const payload = {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					country: user.country,
					registrationType: user.registrationType,
					picture: user.picture,
					referral: user.referral,
					emailVerified: user.emailVerified,
					type: user.type,
					lastLoginDateAndTime: user.lastLoginDateAndTime,
					points: ( user.points ).toFixed( 4 )
				};

				// Get current time stamp and save it as last login time
				const userField = {};
				userField.lastLoginDateAndTime = Math.round((new Date()).getTime() / 1000);

				// Save the last login data and time for this user.
				User.findOneAndUpdate( { email: user.email }, { $set: userField }, { new: true } )
					.then( ( user ) => console.log( 'user last login time updated' ) )
					.catch( ( errors ) => res.json( errors ) );

				/**
				 * jwt.sign() takes the data passed in payload and signs it, creates a hash and returns a token value.
				 * It takes the payload data as the first param and the secret as the second and returns a token, which we will
				 * send to the user when they sign in or login.
				 * payload contains user info to be sent
				 * keys.secretOrKey is imported from config/keys.js which we can set to anything, which is sent for security
				 * expiresIn is in secs, which is when the token expires, then fourth param is the call back function.
				 */
				jwt.sign( payload, secretKey, { expiresIn: 3600 }, ( err, token ) => {
					res.json( { success: true, token: 'Bearer ' + token } );
				} );
			} else {
				errors.userNameOrEmail = 'Login Failed';
				// If the password does not match
				return res.status( 400 ).json( errors );
			}
		} );
});

/**
 * @route POST /api/users/sendResetPassEmail
 * @desc send reset password email that contains link to reset password
 * @access Public
 */
router.post( '/sendResetPassEmail', csrfProtection, ( req, res ) => {

	const error = {};

	if ( ! req.body.forgotPasswordEmail ) {
		error.forgotPasswordEmail = 'Email field is empty';
		return res.status(400).json( { forgotPasswordEmail: error.forgotPasswordEmail } );
	}

	User.findOne( { email: req.body.forgotPasswordEmail } )
		.then( ( user ) => {
			if ( ! user ) {

				error.forgotPasswordEmail = 'Email not registered';
				return res.status( 400 ).json( { forgotPasswordEmail: error.forgotPasswordEmail } );

			} else if ( 'inactive' === user.status ) {

				error.forgotPasswordEmail = 'Email not verified';
				return res.status( 400 ).json( { forgotPasswordEmail: error.forgotPasswordEmail } );

			} else {
				// If email is valid send an email with token
				// Generate Random String to be sent for email
				//@todo change this url later from localhost 3000 to the real site url
				let randString = randomstring.generate(),
					emailVrfRedirectUrl = 'http://localhost:3000/resetPassword?email='+ req.body.forgotPasswordEmail +'&token=' + randString;

				// Compose a mail
				const html = 'Hi ' + user.firstName + '!' +
					'<br><h2>Password Reset Email</h2>' +
					'<br>Please click on the below link to reset your password' +
					'<br><a target="_blank" href="' + emailVrfRedirectUrl + user._id + '">' + emailVrfRedirectUrl + user._id + '</a>' +
					'<br><br>Thanks,' +
					'<br>Coinrewarder';

				mailer.sendEmail(
					'"Coinrewarder" <Imran.Sayed@myrl.tech>', // from
					user.email, // to
					'Password reset request', // sub
					html // body
				);

				// Save the passwordResetToken into db
				const userFields = {};
				userFields.passwordResetToken = randString + user._id;
				User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
					.then( ( user ) => res.json( user ) )
					.catch( ( errors ) => res.json( errors ) );

			}
		} )
		.catch( error => {
			res.status( 400 ).json( {forgotPasswordEmail: error} )
		} );
} );

/**
 * @route POST /api/users/resetPassword
 * @desc reset password
 * @access public
 */
router.post( '/resetPassword', csrfProtection, ( req, res ) => {

	const { errors, isValid } = validateResetPasswordInput( req.body );

	// If validation fails then send the response 400 with errors object
	if ( ! isValid ) {
		return res.status( 400 ).json( errors );
	}

	User.findOne( { email: req.body.email } )
		.then( user => {
			if ( req.body.passwordResetToken === user.passwordResetToken ) {
				// Update the new password.
				/**
				 * Generate Salt with bcrypt.genSalt() and then hash the password using bcrypt.hash()
				 */
				bcrypt.genSalt( 10, ( err, salt ) => {
					bcrypt.hash( req.body.password, salt, ( err, hash ) => {
						// If there is an error throw the error, otherwise set the newUser.password equal to hash created from bcrypt.hash()
						if ( err ) throw  err;
						const userFields = {};
						userFields.password = hash;
						User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
							.then( ( user ) => res.json( user ) )
							.catch( ( errors ) => res.json( errors ) );

					} );
				} );

			} else {
				errors.password = 'Token not valid';
				return res.status( 400 ).json( { password: errors.password } );
			}
		} )

} );


/**
 * @route POST api/users/changePassword
 * @desc Login User /
 * @access private
 */
router.post( '/changePassword',csrfProtection, ( req, res ) =>{
    const { errors, isValid } = validateChangePassword( req.body );

    // If validation fails then send the response 400 with errors object
    if ( ! isValid ) {
        return res.status( 400 ).json( errors );
    }
    const user = (req.body.userId);
    const password = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    User.findOne(  { _id : user}  )
        .then( ( user ) => {

            // Check for user
            if ( ! user ) {
                errors.user = 'User not found';
                return res.status( 404 ).json( errors );
            }


            /**
             * If user found , check password,
             * Note that the password available from req.body.password, is plain text hence
             * we should use bycrypt.compare() which will take the plain text password 'req.body.password' as first param and
             * hashed password 'user.password' as a second param and return true inside 'isMatch' variable if matched, false otherwise.
             */
            bcrypt.compare( password, user.password )
                .then( ( isMatch ) => {
                    // If the password matches isMatch will be true.
                    if ( isMatch ) {

                        if ( newPassword ) {
                            /**
                             * Update the new password.
                             * Generate Salt with bcrypt.genSalt() and then hash the password using bcrypt.hash()
                             */
                            bcrypt.genSalt( 10, ( err, salt ) => {
                                bcrypt.hash( newPassword, salt, ( err, hash ) => {
                                    // If there is an error throw the error, otherwise set the newUser.password equal to hash created from bcrypt.hash()
                                    if ( err ) throw  err;
                                    const userFields = {};
                                    userFields.password = hash;
                                    User.findOneAndUpdate( { _id: user._id }, { $set: userFields }, { new: true } )
                                        .then( ( user ) => res.json( user ) )
                                        .catch( ( errors ) => res.json( errors ) );

                                } );
                            } );
                        }

                    }
                } )
        } )


});



/**
 * @route POST /api/users/resendVerificationEmail
 * @desc Resend email verifications email
 * @access public
 */
router.post( '/resendVerificationEmail', csrfProtection, ( req, res ) => {


	const error = {};

	if ( ! req.body.email ) {
		error.emailResendVerification = 'Email field is empty';
		return res.status(400).json( { emailResendVerification: error.emailResendVerification } );
	}

	User.findOne( { email: req.body.email } )
		.then( ( user ) => {
			if ( ! user ) {
				error.emailResendVerification = 'Email not registered';
				return res.status( 400 ).json( { emailResendVerification: error.emailResendVerification } );

			} else if ( 'active' === user.status ) {
				error.emailResendVerification = 'Account already verified';
				return res.status( 400 ).json( { emailResendVerification: error.emailResendVerification } );
			} else {
				// If email is valid send an email with token
				// Generate Random String to be sent for email
				//@todo change this url later from localhost 3000 to the real site url
				let randString = randomstring.generate(),
					emailVerificationExpTime = Math.round((new Date()).getTime() / 1000) + ( 24 * 60 * 60 ),
					emailVrfRedirectUrl = 'http://localhost:3000/resetPassword?email='+ req.body.email +'&token=' + randString;

				// Compose a mail
				const html = 'Hi ' + user.firstName + '!' +
					'<br>Please verifiy your email on the below link to complete your registration process' +
					'<br>Your verification token is: <strong>' + randString + user._id + '</strong>' +
					'<br>Or you can directly click on the below link to verify' +
					'<br><a target="_blank" href="' + emailVrfRedirectUrl + user._id + '">' + emailVrfRedirectUrl + user._id + '</a>' +
					'<br>This verification email will be valid for 24 hours, post which you need to request a new verification email.' +
					'<br>Thanks,' +
					'<br>Coinrewarder';

				mailer.sendEmail(
					'"Coinrewarder" <Imran.Sayed@myrl.tech>', // from
					user.email, // to
					'Email Verification', // sub
					html // body
				);

				// Save the passwordResetToken into db
				const userFields = {};
				userFields.secretToken = randString + user._id;
				userFields.emailVerificationExpiry = emailVerificationExpTime;
				User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
					.then( ( user ) => res.json( user ) )
					.catch( ( errors ) => res.json( errors ) );

			}
		} )
		.catch( error => res.status( 400 ).json( error ) );

} );

/**
 * @route POST /api/users/updateUser
 * @desc Update User
 * @access private
 */
router.post( '/updateUser', csrfProtection, passport.authenticate( 'jwt', { session: false } ), ( req, res ) => {

	const errors = {};

	User.findOne( { _id: req.body.userId } )
		.then( user => {
			if ( user ) {

				// Update the password only if users has request for password change.
				if ( req.body.password ) {
					/**
					 * Update the new password.
					 * Generate Salt with bcrypt.genSalt() and then hash the password using bcrypt.hash()
					 */
					bcrypt.genSalt( 10, ( err, salt ) => {
						bcrypt.hash( req.body.password, salt, ( err, hash ) => {
							// If there is an error throw the error, otherwise set the newUser.password equal to hash created from bcrypt.hash()
							if ( err ) throw  err;
							const userFields = {};
							userFields.password = hash;
							User.findOneAndUpdate( { email: user.email }, { $set: userFields }, { new: true } )
								.then( ( user ) => console.log( user ) )
								.catch( ( errors ) => res.json( errors ) );

						} );
					} );
				}

				const newUserFields = {};
				newUserFields.userName = ( req.body.userName ) ? req.body.userName : user.userName;
				newUserFields.firstName = ( req.body.firstName ) ? req.body.firstName : user.firstName;
				newUserFields.lastName = ( req.body.lastName ) ? req.body.lastName : user.lastName;
				newUserFields.email = ( req.body.email ) ? req.body.email : user.email;
				newUserFields.country = ( req.body.country ) ? req.body.country : user.country;
				newUserFields.referral = ( req.body.referral ) ? req.body.referral : user.referral;

				// Update user details
				User.findOneAndUpdate( { email: user.email }, { $set: newUserFields }, { new: true } )
					.then( ( user ) => {
						console.log( 'came' );
						res.json( user )
					} )
					.catch( ( errors ) => res.json( errors ) );

			} else {
				errors.password = 'User Not Found';
				return res.status( 400 ).json( { editUserPassword: errors.password } );
			}
		} )

} );

/**
 * @route GET api/users/current
 * @desc Return current User /
 * @access Private
 */
router.get( '/current', passport.authenticate( 'jwt', { session: false } ), ( req, res ) => {
	/**
	 * You have the entire user object available here in req.user
	 * so you can access all of its properties inside when setting the value of msg as an object.
	 */
	User.findById( req.user.id )
		.then( ( user ) => res.json( user ) )
		.catch( ( errors ) => res.json( errors ) );
} );

/**
 * @route GET api/users/getUserCount
 * @desc Get total user count on the site
 * @access private
 */
router.get( '/getUserCount', ( req, res ) => {
	User.find()
		.count()
		.then( vendorCount => res.json( vendorCount ) )
		.catch( error => res.json( error ) );
} );

/**
 * @route GET /api/users/listUsers/:page
 * @desc Get the users for that page no.
 * @param :page means which page number you need from the data.
 * @access private
 */
router.get( '/listUsers/:page', passport.authenticate( 'jwt', { session: false } ), function( req, res, next ) {

	// perPage is how many users data should be shown in one page
	let perPage = 2;
	let page = req.params.page || 1;

	User
		.find({})
		.sort( { date: -1 } )
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function(err, users) {
			User.countDocuments().exec(function(err, count) {
				if (err) return next(err);

				/**
				 * users: will contain the data of users for the given page.
				 * current: Current page number which is being displayed which is same as the one passed in url
				 * page: Gives total count of pages.
				 */
				res.json( {
					users: users,
					current: page,
					pages: Math.ceil( count / perPage )
				} );
			})
		})
});

/**
 * @route GET /api/users/getUserByUserId/:userId
 * @desc Get the users for that page no.
 * @param :page means which page number you need from the data.
 * @access private
 */
router.get( '/getUserByUserId/:userId', function( req, res, next ) {
	/**
	 * You have the entire user object available here in req.user
	 * so you can access all of its properties inside when setting the value of msg as an object.
	 */
	User.findById( req.params.userId )
		.then( ( user ) => {
			const payload = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				country: user.country,
				registrationType: user.registrationType,
				picture: user.picture,
				referral: user.referral,
				emailVerified: user.emailVerified,
				type: user.type,
				lastLoginDateAndTime: user.lastLoginDateAndTime,
				points: ( user.points ).toFixed( 4 )
			};

			res.json( payload );
		} )
		.catch( ( errors ) => res.json( errors ) );
});

/**
 * @route GET /api/users/getAllUsers
 * @desc Get the users from the database
 * @access private
 */
// router.get( '/getAllUsers/:type', passport.authenticate( 'jwt', { session: false } ), function( req, res ) {
router.get( '/getAllUsers/:type', function( req, res ) {
	// If its admin then get the user.
	if( 'admin' === req.params.type ) {
		User.find({ type: 'user' })
			.then( users => {
				if ( users ) {
					const userData = [];

					// Create the users data in this format and send as response
					users.map( item => {
						userData.push({ id: item._id, label: item.userName })
					}  );
					res.status( 200 ).json( userData );
				} else {
					res.status( 400 ).json( { errors: 'No user found' } );
				}
			} )
			.catch( err => res.status( 400 ).json( err ) )
	}
});



// We export the router so that the server.js file can pick it up
module.exports = router;
