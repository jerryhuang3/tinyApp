var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var PORT = 8080; // default port 8080

// Turns post body into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};




app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = {  username: req.cookies["username"], urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = {  username: req.cookies["username"] };
    res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
    let templateVars = {  username: req.cookies["username"] };
    res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    let templateVars = {  username: req.cookies["username"] };
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
//
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/", (req, res) => {
    const shortURL = generateRandomString();
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
    res.cookie('username',`${req.body.username}`);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect("/urls");
});

app.post("/register", (req, res) => {
    res.redirect("/urls/register"); 
});

function generateRandomString() {
    let shortLink = Math.random().toString(36).substr(2, 6);
    return shortLink;
}