//checks userDatabase for email, returns true if true, undefined if false
const findUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
};
//generates 6 digit alphanumeric string
const generateRandomString = function() {
  const alphanumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let results = "";
  for (let x = 6; x > 0; x--) {
    results += alphanumeric.charAt(Math.round(Math.random() * 61));
  }
  return results;
};

module.exports = {
  findUserByEmail,
  generateRandomString
}