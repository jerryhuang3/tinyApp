var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var PORT = 8080; // default port 8080

// Turns post body into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = {  user: Object.keys(req.cookies), urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = {  user: Object.keys(req.cookies) };
    res.render("urls_new", templateVars);
});

app.get("/urls/login", (req, res) => {
    let templateVars = {  user: Object.keys(req.cookies) };
res.render("login", templateVars);
});

app.get("/urls/register", (req, res) => {
    let templateVars = {  user: Object.keys(req.cookies) };
    res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { user: Object.keys(req.cookies), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    let templateVars = {  user: Object.keys(req.cookies) };
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
// });
//
// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL; // Saves generated string as key and input as longURL
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.newlongURL ;
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    res.cookie(req.body.email, req.body.password);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie(Object.keys(req.cookies));
    res.redirect("/urls");
});

app.post("/register", (req, res) => {
    if (emailLookup(req.body.email) === true) {
        res.status(400).send("HTTP 400 - BAD REQUEST: E-MAIL ALREADY USED!").end();
    } else {
    let userID = generateRandomString();
    users[userID] = {id: userID, email: req.body.email, password: req.body.password};
    res.cookie(req.body.email, req.body.password);
    res.redirect("/urls/register");
    };
});

function generateRandomString() {
    let shortLink = Math.random().toString(36).substr(2, 6);
    return shortLink;
};

function emailLookup(input) {
    let emailArray = [];
    for (let userID in users) {
        emailArray.push(users[userID]['email']);
    };
    for (let i = 0; i < emailArray.length; i++) {
        if (input === emailArray[i]) {
            return true;
        };
    };
};
