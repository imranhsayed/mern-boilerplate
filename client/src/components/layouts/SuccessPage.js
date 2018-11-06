import React, { Component } from 'react';
import queryString from 'qs';
import { Link } from 'react-router-dom';
import Navbar from "../layouts/Navbar";

class SuccessPage extends Component {

	constructor( props ){
		super( props );
		this.state = {
			content: '',
			linkUrl: '',
			linkText: '',
		}
	}

	componentDidMount(){
		const queryStringValues = queryString.parse( this.props.location.search.slice(1) );

		// On Reset Password Email Sent
		if ( queryStringValues.reset_pass_email_sent ) {
			this.setState({
				content: 'Password Reset Email sent! Please follow the link sent in email to reset your password.',
				linkUrl: '/',
				linkText: 'Home'
			});
		}

		// On Reset Password Success
		if ( queryStringValues.password_reset ) {
			this.setState({
				content: 'Password Reset Successfull ! You can Login Now.',
				linkUrl: '/login',
				linkText: 'Login'
			});
		}
	};

	render(){
		return(
			<div>
				<div className="container-fluid px-md-0">
					<Navbar/>
					<div className="container" style={{ marginTop: '200px' }}>
						<div className="jumbotron text-center">
							<h3>Success!</h3>
							<p>{ this.state.content }</p>
							<Link to={this.state.linkUrl}><button className="btn btn-primary">{this.state.linkText}</button></Link>
						</div>
					</div>
				</div>
			</div>

		);
	}
}

export default SuccessPage;