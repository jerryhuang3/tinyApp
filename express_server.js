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
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
    let templateVars = { user: users[req.cookies.userid], urls: urlDatabase };
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
    let templateVars = { user: users[req.cookies.userid]['email'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    let templateVars = { user: users[req.cookies.userid]['email'] };
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
    urlDatabase[shortURL] = {"longURL": req.body.longURL, "userID": req.cookies.userid}; // Saves generated string as key and input as longURL
    console.log(urlDatabase);
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

app.post("/urls/login", (req, res) => {
    let id = emailLookup(req.body.email);
    
    if (id !== undefined && req.body.password === users[id]["password"] ) {
        res.cookie("userid", id);
        res.redirect("/urls");
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
        users[userID] = {id: userID, email: req.body.email, password: req.body.password};
        res.cookie("userid", userID);
        res.redirect("/urls");
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
