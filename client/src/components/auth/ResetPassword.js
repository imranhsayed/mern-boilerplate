import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from "classnames";
import { getCsrfToken } from "../../actions/authActions";
import { resetPassUsingToken } from "../../actions/authActions";
import queryString from 'qs';
import Navbar from "./../layouts/Navbar";

class ResetPassword extends Component {

	constructor( props ){
		super( props );
		this.state = {
			email: '',
			passwordResetToken: '',
			password: '',
			password2: '',
			_csrf: '',
			errors: {}
		}
	}

	componentDidMount() {
		this.props.getCsrfToken();
		const queryStringValues = queryString.parse( this.props.location.search.slice(1) );
		if ( queryStringValues.email && queryStringValues.token ) {
		    this.setState({
			    email: queryStringValues.email,
			    passwordResetToken: queryStringValues.token
		    })
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.errors ) {
			this.setState( { errors: nextProps.errors } )
		}
	}

	onChange = ( event ) => {
		this.setState({[ event.target.name ]: event.target.value })
	};

	onSubmit = ( event ) => {
		const { csrfToken } = this.props.auth;
		event.preventDefault();
		const userData = {
			email: this.state.email,
			errors: this.state.errors,
			passwordResetToken: this.state.passwordResetToken,
			password: this.state.password,
			password2: this.state.password2,
			_csrf: csrfToken
		};
		console.log( userData );
		this.props.resetPassUsingToken( userData, this.props.history );
	};

	render(){

		const { errors } = this.state;

		return(
			<div className="container">
				<Navbar/>
				<div className="row d-flex justify-content-center align-items-center">
					<div className="col-8 col-md-7 col-lg-5 mt-5">
						<form onSubmit={ this.onSubmit }>
							<div className="form-row">
								<div className="form-group col-12 mt-3 mb-4">
									{/*<img className="img-responsive logo-image" src="/image/logo.png" alt="Logo"/>*/}
									<h2>Reset Password</h2>
								</div>
								<h4 className="text-center">Reset Password</h4><br/><br/>
								<h6 className="text-muted mb-3">Please Enter your new password</h6>
								<div className="form-group col-12  pwdicon">
									<input type="password" name="password" className={ classnames( 'form-control', {
										'is-invalid': errors.password
									} ) }
									       value={ this.state.password }
									       onChange={ this.onChange }
									       placeholder="New Password"/>
									{ errors.password && ( <div className="invalid-feedback">{ errors.password }</div> ) }
									<i className="fas fa-lock"></i>
								</div>
								<div className="form-group col-12  pwdicon">
									<input type="password" name="password2" className={ classnames( 'form-control', {
										'is-invalid': errors.password2
									} ) }
									       value={ this.state.password2 }
									       onChange={ this.onChange }
									       placeholder="Confirm New Password"/>
									{ errors.password2 && ( <div className="invalid-feedback">{ errors.password2 }</div> ) }
									<i className="fas fa-lock"></i>
								</div>
								<div className="form-group col-12">
									<button type="submit" className="btn btn-primary log-in"> Reset</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	};
}

ResetPassword.propTypes = {
	getCsrfToken: PropTypes.func.isRequired,
	resetPassUsingToken: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth,
	errors: state.errors
});

export default connect(  mapStateToProps, { getCsrfToken, resetPassUsingToken } )( withRouter( ResetPassword ) );