import React, { Component } from 'react';
import { Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

class Navbar extends Component {
	constructor( props ) {
		super( props );

		this.toggle = this.toggle.bind(this);
		this.state = {
			dropdownOpen: false
		};
	}

	toggle() {
		this.setState({
			dropdownOpen: !this.state.dropdownOpen
		});
	}

	onLogout = ( event ) => {
			this.props.logoutUser();

			// Redirects the user to login page after the user logs out.
			window.location.href = '/login';
	};

	render() {
		const { isAuthenticated } = this.props.auth;

		return (
			<div>
				<Nav tabs>
					<NavItem>
						<Link className="nav-link" to="/">Home</Link>
					</NavItem>
					{ ! isAuthenticated && (
						<div>
							<NavItem style={ { display: 'inline-block' } }>
								<Link className="nav-link" to="/login">Login</Link>
							</NavItem>
							<NavItem style={ { display: 'inline-block' } }>
								<Link className="nav-link" to="/register">Register</Link>
							</NavItem>
						</div>
					) }
					{ isAuthenticated && (
						<NavItem style={ { display: 'inline-block' } }>
							<button className="nav-link" onClick={ this.onLogout }>Logout</button>
						</NavItem>
					) }
				</Nav>
			</div>
		);
	}
}

Navbar.propTypes = {
	logoutUser: PropTypes.func.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth
});

export default connect( mapStateToProps, { logoutUser } )( Navbar );