const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// express
const express = require("express");
const app = express();

require("./config/passport")(passport);

// static files
const path = require("path");
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// body parser
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");

// database
const mongoose = require("mongoose");
require("./public/db.js");
const User = mongoose.model("User");

// express session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global vars for flash msg
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");

    next();
});

app.get("/", (req, res) => {
    res.render("landing", { user: req.user });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { name, email, password1, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password1 || !password2) {
        errors.push({ msg: "All fields required" });
    }
    if (password1 !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    if (password1.length < 6) {
        errors.push({ msg: "Password should be at least 6 characters" });
    }
    if (errors.length > 0) {
        res.render("register", { errors, name, email });
    } else {
        // Validation passed
        User.findOne({ email: email }).then((user) => {
            if (user) {
                errors.push({ msg: "Email already registered" });
                res.render("register", { errors, name, email });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password: password1,
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then((user) => {
                                req.flash("success_msg", "You are now registered and can log in");

                                res.redirect("/login");
                            })
                            .catch((err) => console.log(err));
                    })
                );
            }
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

const { ensureAuthenticated } = require("./config/auth");
app.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", { name: req.user.name });
});

app.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`));
