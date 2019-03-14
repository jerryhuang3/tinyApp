var express = require("express");
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
var app = express();
var PORT = 8080; // default port 8080

// Turns post body into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let userDatabase = urlsForUser(req.cookies.userid);
    let templateVars = { user: users[req.cookies.userid], urls: userDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.cookies.userid] };
    if (req.cookies.userid === undefined) {
        res.redirect("/urls");
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/login", (req, res) => {
    let templateVars = { user: users[req.cookies.userid] };
res.render("login", templateVars);
});

app.get("/urls/register", (req, res) => {
    let templateVars = { user: users[req.cookies.userid] };
    res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { user: users[req.cookies.userid], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    let templateVars = { user: users[req.cookies.userid] };
    let long = urlDatabase[req.params.shortURL].longURL;
    res.redirect(long);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {"longURL": req.body.longURL, "userID": req.cookies.userid}; // Saves generated string as key and input as longURL
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    if (urlDatabase[req.params.shortURL]["userID"] === req.cookies.userid)
    {
    delete urlDatabase[req.params.shortURL];
    };
    res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.newlongURL ;
    res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
    let id = emailLookup(req.body.email);
    
    if (id !== undefined && bcrypt.compareSync(req.body.password, users[id]["password"]) === true ) {
        res.cookie("userid", id);
        res.redirect("/urls");
        console.log(users);
    } else {
        res.status(403).send("HTTP 403 - NOT FOUND: E-MAIL OR PASSWORD INCORRECT!")
    };
});

app.post("/logout", (req, res) => {
    res.clearCookie(Object.keys(req.cookies));
    res.redirect("/urls");
});

app.post("/register", (req, res) => {
    if (emailLookup(req.body.email) !== undefined) {
        res.status(400).send("HTTP 400 - BAD REQUEST: E-MAIL ALREADY USED!").end();
    } else {
        let userID = generateRandomString();
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
        res.cookie("userid", userID);
        res.redirect("/urls");
        console.log(users);
    };
});

function generateRandomString() {
    let shortLink = Math.random().toString(36).substr(2, 6);
    return shortLink;
};

function emailLookup(input) {
    for (let userID in users) {
        if (input === users[userID]['email']) {
            return users[userID]['id'];
        };
    };
};

function urlsForUser(id) {
    let userDatabase = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL]["userID"] === id) {
            userDatabase[shortURL] = urlDatabase[shortURL]["longURL"];
        };
    };
    return userDatabase;
};