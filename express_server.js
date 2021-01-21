const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const findUserByEmail = require('./helper')

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

const users = { };
const urlDatabase = { };

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


//cause i got sick of typing /urls and everyone keeps telling me programmers are lazy, now you can just write localhost:8080 and you're at the login page
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect("/urls")
  } else {
    res.redirect("/login");
  }

});

//renders url_index
app.get("/urls", (req, res) => {
  const userID = req.session.userID; 
  const templateVars = {
    urls: urlDatabase,
    users,
    userID
  };
  console.log(userID)
  res.render("urls_index", templateVars);
});

//checks if user is sign in, the renders page if they are. if theyre not, directed to login page
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.render("urls_new", {users, userID});
  } else {
    res.redirect("/login");
  }
});

//rengers urls_show
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users,
    userID
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders registration page
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  res.render("registration", {users, userID});
});

//renders login page
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  res.render("login", {users, userID});
});

//forgot to make this earlier, allows short url usable by anyone
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
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
  }
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`); 
});


//deletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//edits url
app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
});


//logs user in , checks email and password match
app.post("/login", (req, res) => {

  if(findUserByEmail(req.body.email, users)) {
    for (const user in users) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.userID =  users[user].id
        res.redirect(`/urls`);
      } 
    } return res.status(403).send("Password does not match!")  
  } else {
    return res.status(403).send("Email does not exist!")
  }
})

//logs out and deletes cookies
app.post('/logout', (req, res) => {
  req.session = null
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
  const password = req.body.password; //written so i get a better understanding of bcrypt; easier to read
  const hashedPassword = bcrypt.hashSync(password, 10);
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
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
