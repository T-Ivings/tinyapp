const findUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
};
const generateRandomString = function() {
  const alphanumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let results = "";
  let randomNumber; //added variable for extra clarification and a cleaner line 16
  for (let x = 6; x > 0; x--) {
    randomNumber = Math.round(Math.random() * 61);
    results += alphanumeric.charAt(randomNumber);
  }
  return results;
};

module.exports = {
  findUserByEmail,
  generateRandomString
}