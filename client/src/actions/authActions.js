import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

// jwt-decode module is used to decode the user data from auth token
import jwt_decode from 'jwt-decode';
import { GET_ERRORS, SET_CURRENT_USER, GET_USER_COUNT, CSRF_TOKEN, GET_USERS, GET_USER, GET_USER_DATA } from './types';
// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Get the csrf token
export const getCsrfToken = () => dispatch => {
	// dispatch(setPostLoading());
	axios
		.get('/api/users/getCsrfToken')
		.then( res =>
			dispatch({
				type: CSRF_TOKEN,
				payload: res.data
			})
		)
		.catch( err =>
			dispatch({
				type: CSRF_TOKEN,
				payload: null
			})
		);
};

/**
 * Register User: registerUser()
 * Note this is being exported as registerUser const in App.js
 * @param userData
 * @param history
 * @return {function(*)}
 */
export const registerUser =  ( userData, history ) => dispatch => {
	/**
	 * axios.post() makes a post request at 'http://localhost:5000/api/users/register',
	 * which in turn will will call the router.post( '/register'..) function in node js backend,
	 * which will check validation and on no errors will register the user and save it into database
	 * router.post( '/register'..) returns a new user object which will be available in result.data
	 * accessible in then().
	 * And if there will be any errors it will be availablea in err.response.data down below.
	 * Note that we didn't have to prefix 'http://localhost:5000' in the url down below, because
	 * we have set proxy value in package.json to 'http://localhost:5000'.
	 * We set the state of the errors object to the new error object that we receive from err.response.data
	 * If on successful registration, inside then(), history.push( '/login' ) will redirect the user to the login page.
	 */
	axios.post( '/api/users/register', userData, { withCredentials: true } )
		.then( res => history.push( `/verifyEmail?email=${res.data.email}` ) )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) )

};

/**
 * Verify Email Token
 * @param userData
 * @param history
 * @return {function(*)}
 */
export const verifyEmailToken =  ( userData, history ) => dispatch => {

	axios.post( '/api/users/verifyRegistrationEmail', userData, { withCredentials: true } )
		.then( res => history.push( '/login?email_verified=true' ) )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) )

};

/**
 * Send reset password email
 * @param userData
 * @return {function(*)}
 */
export const sendResetPassEmail =  ( userData, history ) => dispatch => {

	axios.post( '/api/users/sendResetPassEmail', userData, { withCredentials: true } )
		.then( res => history.push( '/success-page?reset_pass_email_sent=success' ) )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) )
};

/**
 * Resend verification Email
 * @param userData
 * @return {function(*)}
 */
export const resendVerificationEmail =  ( userData, history ) => dispatch => {

	axios.post( '/api/users/resendVerificationEmail', userData, { withCredentials: true } )
		.then( res => history.push( `/verifyEmail?email=${res.data.email}` ) )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) )

};

/**
 * Reset password after verifying the token received.
 * @param userData
 * @param history
 * @return {function(*)}
 */
export const resetPassUsingToken =  ( userData, history ) => dispatch => {

	axios.post( '/api/users/resetPassword', userData, { withCredentials: true } )
		.then( res => history.push( '/success-page?password_reset=success' ) )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) )

};

// Login - Get User Token. This is loginUser() Action
export const loginUser = ( userData, history ) => dispatch => {

	axios.post( '/api/users/login', userData )
		.then( ( result ) => {
			/**
			 * Once you get the response , save the data received from result.data to localStorage
			 * We are using object destructuring here, below code is equivalent to const token = result.data.token
			 */
			const { token } = result.data;

			// Store token in localStorage
			localStorage.setItem( 'jwtToken', token );

			// Set token to Auth Header using a custom function setAuthToken
			setAuthToken( token );

			// Use jwt-decode to decode the auth token and get the user data from it( install jwt-decode in clients dir )
			const decoded = jwt_decode( token );

			// Set current user
			dispatch( setCurrentUser( decoded ) );

			// Once he is logged in send him to dashboard
			history.push( '/dashboard' );
		} )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) );
};

// Login with Facebook- Get User Token.
export const loginWithFacebook = ( userData, history ) => dispatch => {

	axios.post( '/api/users/loginViaFacebook', userData )
		.then( ( result ) => {
			/**
			 * Once you get the response , save the data received from result.data to localStorage
			 * We are using object destructuring here, below code is equivalent to const token = result.data.token
			 */
			const { token } = result.data;

			// Store token in localStorage
			localStorage.setItem( 'jwtToken', token );

			// Set token to Auth Header using a custom function setAuthToken
			setAuthToken( token );

			// Use jwt-decode to decode the auth token and get the user data from it( install jwt-decode in clients dir )
			const decoded = jwt_decode( token );


			// Set current user
			dispatch( setCurrentUser( decoded ) );

			// Once he is logged in send him to dashboard
			history.push( '/dashboard' );
		} )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) );
};

// Login with Google- Get User Token.
export const loginWithGoogle = ( userData, history ) => dispatch => {

	axios.post( '/api/users/loginViaGoogle', userData )
		.then( ( result ) => {
			/**
			 * Once you get the response , save the data received from result.data to localStorage
			 * We are using object destructuring here, below code is equivalent to const token = result.data.token
			 */
			const { token } = result.data;

			// Store token in localStorage
			localStorage.setItem( 'jwtToken', token );

			// Set token to Auth Header using a custom function setAuthToken
			setAuthToken( token );

			// Use jwt-decode to decode the auth token and get the user data from it( install jwt-decode in clients dir )
			const decoded = jwt_decode( token );

			// Set current user
			dispatch( setCurrentUser( decoded ) );

			// Once he is logged in send him to dashboard
			history.push( '/dashboard' );
		} )
		.catch( ( err ) => dispatch( {
			type: GET_ERRORS,
			payload: err.response.data
		} ) );
};

// Set logged in user
export const setCurrentUser = ( decoded ) => {
	return {
		type: SET_CURRENT_USER,
		payload: decoded
	}
};



// Log User Out
export const logoutUser = () => dispatch => {
	// Remove token from localStorage
	localStorage.removeItem( 'jwtToken' );

	// When we pass the token value as false, setAuthToken() removes the Authorization token from the header of http request because user is logged out,
	setAuthToken( false );

	// Set the current user to an empty object, which will set the isAuthenticated state of redux store to false.
	dispatch( setCurrentUser( {} ) );
};

// Update user as a vendor
export const getCurrentUser = ( auth = ''  ) => dispatch => {
	axios
		.get('/api/users/current')
		.then( res => dispatch({
				type: SET_CURRENT_USER,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};
//change user password
export const changePassword = ( userData )=> dispatch =>{
    axios.post( '/api/users/changePassword/', userData )
        .then( res => dispatch({
                type: GET_USER_DATA,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );

};

// Get User List by PageNo
export const getUserListByPageNo = ( pageNo ) => dispatch => {
	axios
		.get( `/api/users/listUsers/${pageNo}` )
		.then( res => dispatch({
				type: GET_USERS,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};

// Get user by UserId
export const getUserByUserId = ( userId ) => dispatch => {
	axios
		.get( `/api/users/getUserByUserId/${userId}` )
		.then( res => dispatch({
				type: SET_CURRENT_USER,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};


export const updateUser = ( userObj ) => dispatch => {
	axios
		.post( '/api/users/updateUser/', userObj )
		.then( res => dispatch({
				type: GET_USER,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);

	dispatch({
		type: GET_USER,
		payload: userObj
	})
};

/**
 * Get all the Users Data
 * NOte that we are passing the userType and the csrf token to ensure this is protected
 *
 * @return {function(*)}
 */
export const getAllUsers = ( userType ) => dispatch => {
	axios
		.get( `/api/users/getAllUsers/${userType}` )
		.then( res => dispatch({
				type: GET_USERS,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};


export const yourUser = ( userObj ) => dispatch => {
	dispatch({
		type: SET_CURRENT_USER,
		payload: userObj
	})
};

// Get all user Count
export const getUserCount = () => dispatch => {
	axios
		.get('/api/users/getUserCount')
		.then( res => dispatch({
				type: GET_USER_COUNT,
				payload: res.data
			})
		)
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};
