const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { reset } = require('nodemon');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  if (user.updatedOn) {
    let after30Minutes = new Date(user.updatedOn.getTime() + 1 * 10 * 1000);
    let now = new Date();
    console.log(after30Minutes);
    console.log(now);
    console.log(after30Minutes < now);

    if (user.attempt > 5 && after30Minutes > now) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts,wait 30 Minutes before try again !!'
      );
    } else if (user.attempt > 5 && after30Minutes < now) {
      authenticationRepository.resetAttempt(email);
      console.log('reset');
    }
  }

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  const user2 = await authenticationRepository.getUserByEmail(email);
  console.log(user2.attempt);

  authenticationRepository.loginAttempt(email, user2.attempt + 1);
  return null;
}

module.exports = {
  checkLoginCredentials,
};
