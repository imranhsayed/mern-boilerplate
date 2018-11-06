const Validator = require( 'validator' );
const isEmpty = require( './is-empty' );

// Set the validateResetPasswordInput() equal to module.exports so that it can be accessed in other files
module.exports = function validateChangePassword( data ) {
    let errors = {};

    /**
     * Set the firstName value equal to an empty string if user has not entered the name, otherwise the Validator.isEmpty() wont work down below.
     * Note that the isEmpty() here is our custom function defined in is-empty.js and
     * Validator.isEmpty() down below comes from validator library.
     * Similarly we do the same for email, password and password2( confirm password )
     */
    data.oldPassword = ( ! isEmpty( data.oldPassword ) ) ? data.oldPassword : '';
    data.confPassword = ( ! isEmpty( data.confPassword ) ) ? data.confPassword : '';

    if ( Validator.isEmpty( data.oldPassword ) ) {
        errors.oldPassword = 'Password is empty';
    }

    // If the length of the password is not between 6 to 30 char then set errors.password
    if ( ! Validator.isLength( data.newPassword, { min: 8, max: 32 } ) ) {
        errors.newPassword = 'Password must be 8 to 32 characters';
    }

    // if ( ! Validator.isLength( data.confPassword, { min: 8, max: 32 } ) ) {
    //     errors.confPassword = 'Password must be 8 to 32 characters';
    // }
    // Check if password and password2( confirm password ) is the same.
    if ( ! Validator.equals( data.newPassword, data.confPassword ) ) {
        errors.confPassword = 'Passwords must match';
    }
    if ( Validator.isEmpty( data.newPassword ) ) {
        errors.newPassword = 'New Password is empty';
    }
    if ( Validator.isEmpty( data.confPassword ) ) {
        errors.confPassword = 'Confirm Password is empty';
    }
    // console.log('may66',errors);

    return {
        errors,
        isValid: isEmpty( errors )
    }
};