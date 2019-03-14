/*========================Modules==============================*/
var express = require('express');
var app = express();
app.set("view engine", "ejs");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


/*==========================Port===============================*/
var PORT = process.env.PORT || 8000;
app.listen(PORT);


/*======================Encrypted Cookies======================*/
var cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ["secretkey"]
}));


/*=========================Database============================*/
const urlDatabase = {};
const users = {};


/*=========================Functions===========================*/
// Generates 8 digit unique id
function generateRandomString() {
    let shortLink = Math.random().toString(36).substr(2, 8);
    return shortLink;
};

// Returns user ID if login or registration email matches
function emailLookup(input) {
    for (let userID in users) {
        if (input === users[userID]['email']) {
            return users[userID]['id'];
        };
    };
};

// Creates object with all of user's short and long URLs
function urlsForUser(id) {
    let userDatabase = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL]["userID"] === id) {
            userDatabase[shortURL] = urlDatabase[shortURL]["longURL"];
        };
    };
    return userDatabase;
};



/*===========================GET===============================*/

// Home Page
app.get("/", (req, res) => {
    res.redirect("/urls");
});

// Display all URLs created by logged in user
app.get("/urls", (req, res) => {
    let userDatabase = urlsForUser(req.session.userid);
    let templateVars = { user: users[req.session.userid], urls: userDatabase };
    res.render("urls_index", templateVars);
});

// Creating new URL page
app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    if (req.session.userid === undefined) {
        res.redirect("/urls");
    };
    res.render("urls_new", templateVars);
});

// Login page
app.get("/urls/login", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    res.render("login", templateVars); 
});


// Registration page
app.get("/urls/register", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    res.render("register", templateVars);
});

// Page for each unique short URL
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { user: users[req.session.userid], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
});

// Redirects to page of the stored long url
app.get("/u/:shortURL", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    let long = urlDatabase[req.params.shortURL].longURL;
    res.redirect(long);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/easteregg", (req, res) => {
    res.send("<html><body>Hey you found me!</body></html>\n");
});



/*===========================POST==============================*/
// Generates random short URL and stores into database
app.post("/urls/", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {"longURL": req.body.longURL, "userID": req.session.userid}; 
    res.redirect(`/urls/${shortURL}`); 
});

// Deletes URL and all other and associated information in database
app.post("/urls/:shortURL/delete", (req, res) => {
    if (urlDatabase[req.params.shortURL]["userID"] === req.session.userid) {
        delete urlDatabase[req.params.shortURL];
    };
    res.redirect("/urls");
});

// Updates the long URL to existing short URL
app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.newlongURL ;
    res.redirect("/urls");
});

// Login handling
app.post("/urls/login", (req, res) => {
    let id = emailLookup(req.body.email);
    // Errors out if email or password is incorrect
    if (id !== undefined && bcrypt.compareSync(req.body.password, users[id]["password"]) === true ) {
        req.session.userid = id;
        res.redirect("/urls");
    } else {
        res.status(403).send("HTTP 403 - NOT FOUND: E-MAIL OR PASSWORD INCORRECT!")
    };
});

// Registration handling
app.post("/register", (req, res) => {
    // Errors out if inputted email does not match any in database
    if (emailLookup(req.body.email) !== undefined) {
        res.status(400).send("HTTP 400 - BAD REQUEST: E-MAIL ALREADY USED!").end();
    } else {
        // Encrypts all passwords with bcrypt
        let userID = generateRandomString();
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
        req.session.userid = userID;
        res.redirect("/urls");
    };
});

// Clears cookies upon logging out
app.post("/logout", (req, res) => {
    req.session = null;
res.redirect("/urls");
});
