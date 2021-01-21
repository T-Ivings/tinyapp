const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('./helper');
const { generateRandomString } = require('./helper');
const methodOverride = require('method-override')
//-----------------------------------------------------------

const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["Is this going to work"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(methodOverride('_method'))

const users = { };
const urlDatabase = { };
let urlCount = 0;

//----------------------------------------------------------


//start of server app.get
//redirects "/" to appropriate designation
app.get('/', (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }

});

//renders url_index
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    urls: urlDatabase,
    users,
    userID,
    urlCount
  };
  return res.render("urls_index", templateVars);
});

//checks if user is sign in, the renders page if they are. if theyre not, directed to login page
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.render("urls_new", {users, userID});
  } else {
    return res.redirect("/login");
  }
});

//renders urls_show
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users,
    userID
  };
  if (userID) {
    return res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("Invalid email, you shouldn't be here!");
  }
  
});

//json urlDatabase
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//renders registration page
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  } else {
    return res.render("registration", {users, userID});
  }
});

//renders login page
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  } else {
    return res.render("login", {users, userID});
  }
});

//forgot to make this earlier, allows short url usable by anyone
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]['longURL'];
  return res.redirect(longURL);
});



//posts
//------------------------------------
//saves url to user
app.post('/urls', (req, res) => {
  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const newURL = {
    longURL,
    userID
  };
  urlDatabase[shortURL] = newURL;
  if (userID) {
    return res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(403).send("Invalid user! How did you get here?");
  }

   
});


//deletes specified url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Invalid user!');
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.userID) {
    return res.redirect(`/urls/${req.params.id}`);
  } else {
    return res.status(403).send('Invalid user!');
  }

});

//edits specified url
app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    urlDatabase[req.params.id]['longURL'] = req.body.longURL;
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Invalid user!');
  }
});


//logs user in, checks email and password match
app.post("/login", (req, res) => {

  if (findUserByEmail(req.body.email, users)) {
    for (const user in users) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.userID =  users[user].id;
        return res.redirect(`/urls`);
      }
    } return res.status(403).send("Password does not match!");
  } else {
    return res.status(403).send("Email does not exist!");
  }
});

//logs out and deletes cookies
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});


app.post('/loginPage', (req, res) => {
  return res.redirect('/login');
});

app.post('/registerPage', (req, res) => {
  return res.redirect('/register');
});
    

//registers new user with user specified email, hashes their password, and assigns a 6 digit random string to userID cookie and id
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.session.userID = id;

  if (email === "" || password === "") {
    return res.status(400).send('Please enter a valid username and/or password');
  }
  if (findUserByEmail(email, users)) {
    return res.status(400).send('Email already in use!');
  }

  let newUser = {
    id,
    email,
    password: hashedPassword
  };

  if (findUserByEmail(email, users)) {
    return res.status(400).send('Email already in use!');
  }
  users[id] = newUser;
  return res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
