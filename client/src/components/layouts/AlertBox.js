import React, { Component } from 'react';

class AlertBox extends Component {

	render(){
		let { content, classType } = this.props;
		let classes = 'alert alert-dismissible ' + classType + ' mt-5';
		return(
			<div className={classes} >
				<button type="button" className="close" data-dismiss="alert">x</button>
				{ content }
			</div>
		);
	}
}

export default AlertBox;