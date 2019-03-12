var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
        res.redirect(longURL);
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
    const shortURL = generateRandomString();
    let path = "/urls/" + shortURL;
    urlDatabase[shortURL] = req.body.longURL; // Saves generated string as key and input as longURL
    res.redirect(path);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

function generateRandomString() {
    let shortLink = Math.random().toString(36).substr(2, 6);
    return shortLink;
}