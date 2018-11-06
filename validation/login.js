const Validator = require( 'validator' );
const isEmpty = require( './is-empty' );

// Set the validateRegisterInput() equal to module.exports so that it can be accessed in other files
module.exports = function validateLoginInput( data ) {
	let errors = {};

	/**
	 * Set the email value equal to an empty string if user has not entered the email, otherwise the Validator.isEmpty() wont work down below.
	 * Note that the isEmpty() here is our custom function defined in is-empty.js and
	 * Validator.isEmpty() down below comes from validator library.
	 * Similarly we do it for password.
	 */
	data.userNameOrEmail = ( ! isEmpty( data.userNameOrEmail ) ) ? data.userNameOrEmail : '';
	data.loginPassword = ( ! isEmpty( data.loginPassword ) ) ? data.loginPassword : '';

	if ( Validator.isEmpty( data.userNameOrEmail ) ) {
		errors.userNameOrEmail = 'Username or Email field is required';
	}
	// If the length of the loginPassword is not between 6 to 30 char then set errors.loginPassword
	if ( ! Validator.isLength( data.loginPassword, { min: 8, max: 32 } ) ) {
		errors.loginPassword = 'Password must be 8 to 30 characters';
	}
	if ( Validator.isEmpty( data.loginPassword ) ) {
		errors.loginPassword = 'Password is empty';
	}

	return {
		errors,
		isValid: isEmpty( errors )
	}
};