import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import store from './store';

import { setCurrentUser, logoutUser } from "./actions/authActions";

import PrivateRoute from './components/common/PrivateRoute';
import Home from './components/Home';
import { PrivateComponent } from "./components/PrivateComponent";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import VerifyEmail from "./components/auth/VerifyEmail";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import SuccessPage from "./components/layouts/SuccessPage";
import ResendVerificationEmail from "./components/auth/ResendVerificationEmail";
import Dashboard from "./components/dashboard/Dashboard";


/**
 * To ensure the authenticate state stays true even on page reload, we do the following:
 * Check if the auth token exists in localStorage('jwtToken') , If it does mean user is logged in
 */
if ( localStorage.jwtToken ) {
	/**
	 * Set Auth token header Authorization, setAuthToken is define in utils/setAuthToken,
	 * which provides the auth token stored in local storage to the header of http request.
	 */
	setAuthToken( localStorage.jwtToken );

	// Decode the token( localStorage.jwtToken ) and get user info and exp
	const decoded = jwt_decode( localStorage.jwtToken );

	/**
	 * Set user and isAuthenticated values in the redux store, using setCurrentUser() defined in
	 * authActions.js, which takes the decoded value of the token.
	 */
	store.dispatch( setCurrentUser( decoded ) );

	/**
	 * Check if the token is expired
	 * decoded.exp contains the expiration timestamp of the token.
	 * So if the expiration time is less than the current time
	 * decoded.exp
	 * @type {number}
	 */
	const currentTime = Date.now() / 1000;
	if ( decoded.exp < currentTime ) {
		store.dispatch( logoutUser() );

		// Todo: Clear Current profile and redirect to login
		// store.dispatch( clearCurrentProfile() );

		// Redirects the user to login page when the token is expired and the user logs out.
		window.location.href = '/login';
	}
}

class App extends Component {
	render() {
		return (
			// Provide provides the store to its child components inside of it.
			<Provider store={ store }>
				<Router>
					<div>
						<Route exact path="/" component={ Home } />
						<Route exact path="/register" component={ Register } />
						<Route exact path="/login" component={ Login } />
						<Route exact path="/verifyEmail" component={ VerifyEmail } />
						<Route exact path="/forgot-password" component={ ForgotPassword } />
						<Route exact path="/resetPassword" component={ ResetPassword } />
						<Route exact path="/success-page" component={ SuccessPage } />
						<Route exact path="/resend-verification-email" component={ResendVerificationEmail} />
						{/*Private Routes*/}
						<Switch><PrivateRoute exact path="/dashboard" component={ Dashboard } /></Switch>
						<Switch><PrivateRoute exact path="/private-page" component={ PrivateComponent } /></Switch>
					</div>
				</Router>
			</Provider>
		);
	}
}

export default App;
