import axios from 'axios';

/**
 * Applies the give token to every http request, routes that need authorization.
 * This token goes in the Authorization Headers.
 *
 * @param token
 */
const setAuthToken = ( token ) => {
	if ( token ) {
		/**
		 * If token is available, apply to every http request
		 * Header value is Authorization ( like you pass token in Authorization property in Postman )
		 */
		axios.defaults.headers.common['Authorization'] = token;
	} else {
		// Delete the Auth Header
		delete axios.defaults.headers.common['Authorization']
	}
};

export default setAuthToken;