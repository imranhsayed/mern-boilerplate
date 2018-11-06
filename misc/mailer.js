const nodemailer = require('nodemailer');
const config = require( '../config/mailer' );

	let transporter = nodemailer.createTransport({
		host: 'smtp.mailgun.org',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: config.MAILGUN_USER, // generated ethereal user
			pass: config.MAILGUN_PASSWORD // generated ethereal password
		}
	});

module.exports = {
	sendEmail( from, to, subject, html ){
		return new Promise( ( resolve, reject ) => {
			transporter.sendMail({ from, subject, to, html }, ( err, info ) => {
				if ( err ) reject( err );
				resolve( info );
			} );

		} );
	}
};
