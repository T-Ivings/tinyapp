const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//generates a string of six alphanumeric numbers
function generateRandomString() {
  const alphanumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let results = "";
  let randomNumber; //added variable for extra clarification and a cleaner line 16
  for (let x = 6; x > 0; x--) {
    randomNumber = Math.round(Math.random() * 61)
    results += alphanumeric.charAt(randomNumber)
  }
  return results;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




// After we generate our new shortURL, we add it to our database.
// Our server then responds with a redirect to /urls/:shortURL.
// Our browser then makes a GET request to /urls/:shortURL.
// Our server looks up the longURL from the database, sends the shortURL and longURL to the urls_show template, generates the HTML, and then sends this HTML back to the browser.
// The browser then renders this HTML.
//------------------------------------
app.post('/urls', (req, res) => {

const shortURL = generateRandomString(); //generates a 6 char random string and assigns it to short url
urlDatabase[shortURL] = req.body.longURL; // urlDatabase is an object where the random 6 string chars are keys, longer urls are the values
res.redirect(`/urls/${shortURL}`) //redirects using the random string


});
//------------------------------------

app.post("/urls/:shortURL/delete", (req, res) => {
   delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
})

app.get("/u/:shortURL", (req, res) => {
   const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
