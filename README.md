# A MERN( Mongodb, Express, React, Node ) Boilerplate
## Description
Has following built in functionalities:
-Register with Facebook and Google along with Recaptcha verification

-Login with Facebook and Google along with Recaptcha verification

-Logout

-Email Verification with Mailgun

-Reset Password by sending the new password on email.

-Form Validations at both client and server side.

-Private Routes Option

-Mongodb and Redux Setup

-uses create-react-app


## Installation Instructions

git clone https://github.com/imranhsayed/mern-boilerplate
cd mern-boilerplate
#### in root dir
`$ npm cache clean --force
npm install`
#### in client dir
`$ cd client
npm cache clean --force
npm install`

Install nodemon and create-react-app globally using below command:

`$ npm i -D nodemon`

`$ npm i -g create-react-app`

## Set your Configurations
### Mongodb Configuration

1-Set your mongodb url with username and password in config/keys_dev.js and config/keys_prod.js
`mongoURI: 'mongodb://<dbUsername>:<dbPassword>@ds151853.mlab.com:51853/yourUrl'`

### Mailgun Configuration
2-Set your mailgun username and password in config/mailer.js. Mailgun host configurations are in misc/mailer.js, which you dont need to change if you are using mailgun
`MAILGUN_USER: 'XXX',
MAILGUN_PASSWORD: 'XXX'`

### Login with Facebook, Google, and Recaptcha Configuration
3-Set the following configuration for Login with Facebook and Google and recaptcha in client/src/components/keys/keys.js
`fbAppId = '1776585689892454';`
`googleClientId = '1075202126460-37bbm5sr56a95uiuiijsr6gdo0rmn3.apps.googleusercontent.com';`
`recaptchaSiteKey = '6LdnmHIUAAAAANu0uuiisudiseKUBqhslcTH8hvn9w';`