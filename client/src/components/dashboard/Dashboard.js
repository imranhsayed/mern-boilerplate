import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar from "../layouts/Navbar";

class Dashboard extends Component {
	render() {

		const { user } = this.props.auth;
		console.log( 'user', user );
		return(
			<div>
				<Navbar auth={ this.props.auth }/>
				Welcome { user.firstName } !
			</div>
		);
	}
}

Dashboard.propTypes = {
	auth: PropTypes.object.isRequired
};

const mapStateToProps = ( state ) => ({
	auth: state.auth
});

export default connect( mapStateToProps  )( Dashboard );