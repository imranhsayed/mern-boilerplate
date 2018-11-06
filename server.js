const express = require( 'express' );
const mongoose = require('./mongoose/mongoose');
const bodyParser = require( 'body-parser' );
const path = require( 'path' );
const passport = require( 'passport' );
const cookieParser = require( 'cookie-parser' );



const router = express.Router();

// App instance : Set app equal to the object returned by express();
const app = express();


app.use( cookieParser() );

/**
 * Configure the middleware.
 * bodyParser.json() returns a function that is passed as a param to app.use() as middleware
 * With the help of this method, we can now send JSON to our express application.
 */
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );

const users = require( './routes/api/users' );

app.use( '/api/users', users );


// Passport middleware
app.use( passport.initialize() );


// Include Passport Config
require( './config/passport' )( passport );


// We export the router so that the server.js file can pick it up
module.exports = router;

// Combine react and node js servers while deploying( YOU MIGHT HAVE ALREADY DONE THIS BEFORE
// What you need to do is make the build directory on the heroku, which will contain the index.html of your react app and then point the HTTP request to the client/build directory

if ( process.env.NODE_ENV === 'production' ) {
	// Set a static folder
	app.use( express.static( 'client/build' ) );
	app.get( '*', ( req, res ) => res.sendFile( path.resolve( __dirname, 'client', 'build', 'index.html' ) ) );

}

// Set up a port
const port = process.env.PORT || 5000;

app.listen( port, () => console.log( `Server running on port: ${port}` ) );