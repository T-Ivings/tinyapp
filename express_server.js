const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = { };
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//generates a string of six alphanumeric numbers
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

//checks email against list of emails in use
const emailFinder = function(email) {
  let activeUser;
  for (const user in users) {
    if (users[user].email === email) {
      activeUser = users[user];
    }
  }
  if (activeUser) {
    return true;
  } else {
    return false;
  }
};

//cause i got sick of typing /urls and everyone keeps telling me programmers are lazy
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    users,
    userID
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  res.render("urls_new", {users, userID});
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    userID
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const userID = req.cookies["userID"];
  res.render("registration", {users, userID});
});

app.get("/login", (req, res) => {
  const userID = req.cookies["userID"];
  res.render("login", {users, userID});
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
  res.redirect(`/urls/${shortURL}`); //redirects using the random string
});


//deletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//edits url
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});


//DOES NOT WORK
app.post("/login", (req, res) => {

  if(emailFinder(req.body.email)) {
    for (const user in users) {
      if (users[user].password === req.body.password) {
        res.cookie("userID", users[user].id)
        res.redirect(`/urls`);
      } else {
        return res.status(403).send("Password does not match!")
      }
    }
  } else {
    return res.status(403).send("Email does not exist!")
  }
})

//logs out and deletes cookies
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.post('/loginPage', (req, res) => {
  res.redirect('/login');
});
  
app.post('/registerPage', (req, res) => {
  res.redirect('/register');
});
    

//registers new user with user specified email and password and assigns cookie and id a random string
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  res.cookie("userID", id);

  if (email === "" || password === "") {
    return res.status(400).send('Please enter a valid username and/or password');
  }
  if (emailFinder(email)) {
    return res.status(400).send('Email already in use!');
  }

  let newUser = {
    id,
    email,
    password
  };

  if (emailFinder(email)) {
  return res.status(400).send('Email already in use!');
  }
  users[id] = newUser;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
