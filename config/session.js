import session from 'express-session';
import dotenv from 'dotenv';

// load environment variables from the .env file
dotenv.config();

// configures the session middleware
export default session({
  secret: process.env.SESSION_SECRET,

  // forces the session to be saved
  resave: true,

  // forces a "uninitialized" session to be saved to the store
  saveUninitialized: true,
});
