const findUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
};

module.exports = findUserByEmail;