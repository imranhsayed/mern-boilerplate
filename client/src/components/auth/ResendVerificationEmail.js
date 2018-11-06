import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from "classnames";
import { getCsrfToken } from "../../actions/authActions";
import { resendVerificationEmail } from "../../actions/authActions";
import Navbar from "./../layouts/Navbar";

class ResendVerificationEmail extends Component {

	constructor( props ){
		super( props );
		this.state = {
			email: '',
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
			email: this.state.email,
			errors: this.state.errors,
			_csrf: csrfToken
		};
		this.props.resendVerificationEmail( userData, this.props.history );
	};

	render(){

		const { errors } = this.state;

		return(
			<div className="container">
				<Navbar/>
				<div className="row d-flex justify-content-center align-items-center" style={{ marginTop: '200px' }}>
					<div className="col-8 col-md-7 col-lg-5 mt-5">
						<form onSubmit={ this.onSubmit }>
							<div className="form-row">
								<h4 className="text-center">Send Email Verification</h4><br/><br/>
								<h6 className="text-muted">Enter your registered email on which we will send you an email to verify your account</h6>
								<div className="form-group col-12 nameicon">
									<input type="email" name="email" className={ classnames( 'form-control', {
										'is-invalid': errors.emailResendVerification
									} ) }
									       value={ this.state.email }
									       onChange={ this.onChange }
									       placeholder="Enter Email"/>
									{ errors.emailResendVerification && ( <div className="invalid-feedback">{ errors.emailResendVerification }</div> ) }
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

ResendVerificationEmail.propTypes = {
	getCsrfToken: PropTypes.func.isRequired,
	resendVerificationEmail: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth,
	errors: state.errors
});

export default connect(  mapStateToProps, { getCsrfToken, resendVerificationEmail } )( withRouter( ResendVerificationEmail ) );