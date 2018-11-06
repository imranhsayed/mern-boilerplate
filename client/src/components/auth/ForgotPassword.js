import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from "classnames";
import { getCsrfToken } from "../../actions/authActions";
import { sendResetPassEmail } from "../../actions/authActions";
import Navbar from "./../layouts/Navbar";

class ForgotPassword extends Component {

	constructor( props ){
		super( props );
		this.state = {
			forgotPasswordEmail: '',
			_csrf: '',
			errors: {}
		}
	}

	componentDidMount() {
		this.props.getCsrfToken();
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
			forgotPasswordEmail: this.state.forgotPasswordEmail,
			errors: this.state.errors,
			_csrf: csrfToken
		};
		this.props.sendResetPassEmail( userData, this.props.history );
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
								</div>
								<h4 className="text-center">Reset Password</h4><br/><br/>
								<h6 className="text-muted">Enter your registered email on which reset password link will be sent</h6>
								<div className="form-group col-12 nameicon">
									<input type="email" name="forgotPasswordEmail" className={ classnames( 'form-control', {
										'is-invalid': errors.forgotPasswordEmail
									} ) }
									       value={ this.state.forgotPasswordEmail }
									       onChange={ this.onChange }
									       placeholder="Enter Email"/>
									{ errors.forgotPasswordEmail && ( <div className="invalid-feedback">{ errors.forgotPasswordEmail }</div> ) }
									<i className="fas fa-envelope"></i>
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

ForgotPassword.propTypes = {
	getCsrfToken: PropTypes.func.isRequired,
	sendResetPassEmail: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth,
	errors: state.errors
});

export default connect(  mapStateToProps, { getCsrfToken, sendResetPassEmail } )( withRouter( ForgotPassword ) );