const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function loginAttempt(email, attempt) {
  let now = new Date();
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        updatedOn: now,
        attempt: attempt,
      },
    }
  );
}

async function loginSuccess(email) {
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        attempt: 0,
      },
    }
  );
}

async function resetAttempt(email) {
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        attempt: 0,
      },
    }
  );
}
module.exports = {
  getUserByEmail,
  loginAttempt,
  loginSuccess,
  resetAttempt,
};
