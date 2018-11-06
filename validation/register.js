const Validator = require( 'validator' );
const isEmpty = require( './is-empty' );

// Set the validateRegisterInput() equal to module.exports so that it can be accessed in other files
module.exports = function validateRegisterInput( data ) {
	let errors = {};

	/**
	 * Set the firstName value equal to an empty string if user has not entered the name, otherwise the Validator.isEmpty() wont work down below.
	 * Note that the isEmpty() here is our custom function defined in is-empty.js and
	 * Validator.isEmpty() down below comes from validator library.
	 * Similarly we do the same for email, password and password2( confirm password )
	 */
	data.userName = ( ! isEmpty( data.userName ) ) ? data.userName : '';
	data.firstName = ( ! isEmpty( data.firstName ) ) ? data.firstName : '';
	data.lastName = ( ! isEmpty( data.lastName ) ) ? data.lastName : '';
	data.email = ( ! isEmpty( data.email ) ) ? data.email : '';
	data.country = ( ! isEmpty( data.country ) ) ? data.country : '';
	data.password = ( ! isEmpty( data.password ) ) ? data.password : '';
	data.password2 = ( ! isEmpty( data.password2 ) ) ? data.password2 : '';

	if ( ! Validator.isLength( data.userName, { min: 3, max: 30 } ) ) {
		errors.userName = 'username must be 3 to 30 characters';
	}
	if ( Validator.isEmpty( data.userName ) ) {
		errors.userName = 'username field is required';
	}
	// If the length of the firstName is not between 2 to 30 char then set errors.firstName
	if ( ! Validator.isLength( data.firstName, { min: 2, max: 30 } ) ) {
		errors.firstName = 'First Name must be 2 to 30 characters';
	}
	if ( Validator.isEmpty( data.firstName ) ) {
		errors.firstName = 'First Name field is required';
	}
	if ( ! Validator.isLength( data.firstName, { min: 2, max: 30 } ) ) {
		errors.lastName = 'Last Name must be 2 to 30 characters';
	}
	if ( Validator.isEmpty( data.lastName ) ) {
		errors.lastName = 'Last Name field is required';
	}
	if ( ! Validator.isEmail( data.email ) ) {
		errors.email = 'Email is invalid';
	}
	if ( Validator.isEmpty( data.email ) ) {
		errors.email = 'Email field is required';
	}
	if ( Validator.isEmpty( data.country ) ) {
		errors.country = 'Country field is required';
	}
	if ( Validator.isEmpty( data.password ) ) {
		errors.password = 'Password is empty';
	}
	// If the length of the password is not between 6 to 30 char then set errors.password
	if ( ! Validator.isLength( data.password, { min: 8, max: 32 } ) ) {
		errors.password = 'Password must be 8 to 32 characters';
	}
	if ( ! Validator.isLength( data.password2, { min: 8, max: 32 } ) ) {
		errors.password2 = 'Password must be 8 to 32 characters';
	}
	// Check if password and password2( confirm password ) is the same.
	if ( ! Validator.equals( data.password, data.password2 ) ) {
		errors.password2 = 'Passwords must match';
	}
	if ( Validator.isEmpty( data.password2 ) ) {
		errors.password2 = 'Confirm Password is empty';
	}


	return {
		errors,
		isValid: isEmpty( errors )
	}
};