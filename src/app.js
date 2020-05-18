// database setup
// require("./public/db.js");
// const mongoose = require("mongoose");
// const Message = mongoose.model("Message");

const fetch = require("node-fetch");

// express
const express = require("express");
const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");

// static files
const path = require("path");
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.render("test", { name: "Maxi" });
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.get("/search", (req, res) => {
    fetch(`https://unogsng.p.rapidapi.com/search?query=${req.query.search}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "unogsng.p.rapidapi.com",
            "x-rapidapi-key": "b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07",
        },
    })
        .then((response) => response.json())
        .then((data) => res.render("search", { results: data.results }))
        .catch((err) => {
            console.log(err);
        });
});

app.get("/search/show/:nfid", (req, res) => {
    // console.log(req.params.nfid);

    fetch(`https://unogsng.p.rapidapi.com/episodes?netflixid=${req.params.nfid}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "unogsng.p.rapidapi.com",
            "x-rapidapi-key": "b517c955a2msh5cffdf9da2a3cbep1f65c4jsnfe65e7cbba07",
        },
    })
        .then((response) => response.json())
        .then((data) => res.render("search-show", { results: data }))
        .catch((err) => {
            console.log(err);
        });

    // res.render("search", { title: req.query.search });
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});
