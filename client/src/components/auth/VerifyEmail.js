import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { getCsrfToken } from "../../actions/authActions";
import Navbar from "./../layouts/Navbar";
import queryString from 'qs';
import classnames from "classnames";
import { verifyEmailToken } from "../../actions/authActions";

class VerifyEmail extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			email: '',
			token: '',
			_csrf: '',
			errors: {}
		}
	}

	componentDidMount() {
		this.props.getCsrfToken();

		const queryStringValues = queryString.parse( this.props.location.search.slice(1) );
		if ( queryStringValues.email && queryStringValues.token ) {
		    // User is redirected from email.
			this.setState({
				email: queryStringValues.email,
				token: queryStringValues.token
			});

		} else if ( queryStringValues.email ) {
		    // User is redirected by us after registration.
			this.setState({
				email: queryStringValues.email
			});
		}
	}

	/**
	 * This will run when this Register component receives props/
	 * We will set the state to errors property in this.state() define above in constructor() to nextProps.errors, which will contain
	 * the errors received from redux state.
	 * @param nextProps
	 */
	componentWillReceiveProps( nextProps ) {
		if ( nextProps.errors ) {
			this.setState( { errors: nextProps.errors } )
		}
	}

	onChange = ( event ) => {
		/**
		 * Change the state of name property.
		 * event.target.name will give you the name of the input element, and
		 * event.target.value will give you the value of the input element.
		 */
		this.setState( { [ event.target.name ]: event.target.value } );
	};

	onSubmit = ( event ) => {
		const { csrfToken } = this.props.auth;
		event.preventDefault();
		const userData = {
			email: this.state.email,
			token: this.state.token,
			_csrf: csrfToken,
			errors: this.state.errors
		};

		this.props.verifyEmailToken( userData, this.props.history );
	};


	render() {

		const { csrfToken } = this.props.auth;
		const { errors } = this.state;
		console.log( 'errroor', errors );
		let content = '';

		if ( null !== csrfToken ) {
			content = (
				<div>
					<form className="mt-5" onSubmit={this.onSubmit}>
						<div className="form-group col-12 mt-3">
							<h2 className="text-center heading">Enter Email Verification Token</h2>
							<br/>
							<div className="form-group col-12 mt-1 nameicon">
								<input type="text" name="token" className={ classnames( 'form-control', {
									'is-invalid': errors.token
								} ) }
								       value={ this.state.token }
								       onChange={ this.onChange }
								       placeholder="Enter Token"/>
								{ errors.token && ( <div className="invalid-feedback">{ errors.token }</div> ) }
								<i className="fas fa-key"></i>
							</div>
							<div className="form-group col-12 text-center mt-5">
								<button type="submit" className="btn btn-primary sign-in"> Verify</button>
							</div>
						</div>
					</form>
				</div>
			)
		} else {
			content = <img src="/image/spinner.gif" style={{ width: '200px', margin: 'auto', display: 'block' }} alt="spinner"/>;
		}

		return (
			<div>
				<div className="container" style={{ minHeight: '600px' }}>
					<Navbar/>
					<div className="row d-flex justify-content-center align-items-center mt-5">
						<div className="alert alert-dismissible alert-success mt-5" >
							<button type="button" className="close" data-dismiss="alert">x</button>
							<strong>Thank you for registering with us!</strong> <br/>Please enter the verification token received in your email or follow the link given in the email
						</div>
						{ content }
					</div>
				</div>
			</div>
		);
	}
}

VerifyEmail.propTypes = {
	getCsrfToken: PropTypes.func.isRequired,
	verifyEmailToken: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth,
	errors: state.errors
});

export default connect( mapStateToProps, { getCsrfToken, verifyEmailToken }  )( withRouter( VerifyEmail ) );