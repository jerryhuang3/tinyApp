var express = require('express');
var app = express();
var PORT = 8080;
app.set("view engine", "ejs");

const bcrypt = require('bcrypt');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



/*===================Session Cookies=====================*/
var cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ["secretkey"]
}));



/*======================Database=========================*/
const urlDatabase = {};
const users = {};



/*======================Functions========================*/
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



/*=======================================================*/



app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.get("/urls", (req, res) => {
    let userDatabase = urlsForUser(req.session.userid);
    let templateVars = { user: users[req.session.userid], urls: userDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    if (req.session.userid === undefined) {
        res.redirect("/urls");
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/login", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    res.render("login", templateVars); 
});

app.get("/urls/register", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
    res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { user: users[req.session.userid], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    let templateVars = { user: users[req.session.userid] };
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
    urlDatabase[shortURL] = {"longURL": req.body.longURL, "userID": req.session.userid}; // Saves generated string as key and input as longURL
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
    if (urlDatabase[req.params.shortURL]["userID"] === req.session.userid) {
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
        req.session.userid = id;
        res.redirect("/urls");
    } else {
        res.status(403).send("HTTP 403 - NOT FOUND: E-MAIL OR PASSWORD INCORRECT!")
    };
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});

app.post("/register", (req, res) => {
    if (emailLookup(req.body.email) !== undefined) {
        res.status(400).send("HTTP 400 - BAD REQUEST: E-MAIL ALREADY USED!").end();
    } else {
        let userID = generateRandomString();
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        console.log(hashedPassword);
        users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
        req.session.userid = userID;
        res.redirect("/urls");
    };
});

