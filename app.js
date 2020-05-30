const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const exphbs = require("express-handlebars");
require("./config/passport")(passport);

// express
const express = require("express");
const app = express();

// static files
const path = require("path");
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// body parser
app.use(express.urlencoded({ extended: true }));

// handlebars
// const hbs = exphbs.create({
//     helpers: {
//         isMovie: function (value, options) {
//             if (value.vtype === "movie") {
//                 return options.fn(this);
//             } else {
//                 return options.inverse(this);
//             }
//         },
//     },
// });
// app.engine("handlebars", hbs.engine);
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// database
const mongoose = require("mongoose");
require("./public/db.js");
const User = mongoose.model("User");
const List = mongoose.model("List");
mongoose.set("useFindAndModify", false);

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

// json
app.use(express.json());

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

app.post("/create", ensureAuthenticated, (req, res) => {
    let newList = new List({
        createdBy: req.user.id,
    });
    newList.save(function (err) {
        if (err) {
            console.log(err);
        }
    });
    console.log(req.user.id);
    User.findOneAndUpdate({ _id: req.user.id }, { $push: { lists: newList.id } }, function (
        err,
        data
    ) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
    res.redirect(`list/edit/${newList.id}`);
});

app.get("/list/edit/:listId", ensureAuthenticated, (req, res) => {
    List.findById(req.params.listId, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit-list", data);
        }
    });
});

app.post("/list/edit/:listId", ensureAuthenticated, (req, res) => {
    console.log(req.body);
    let nItem = {};

    if (Object.keys(req.body).length <= 7) {
        nItem = {
            title: req.body.title,
            netflixId: req.body.epid,
            synopsis: req.body.synopsis,
            image: req.body.img,
            season: req.body.seasnum,
            episode: req.body.epnum,
        };
    } else {
        nItem = {
            title: req.body.title,
            netflixId: req.body.nfid,
            synopsis: req.body.synopsis,
            image: req.body.img,
        };
    }

    List.findOneAndUpdate(
        { _id: req.params.listId },
        {
            $push: {
                titles: nItem,
            },
        },
        function (err, data) {
            if (err) {
                console.log("err", err);
            } else {
                console.log("data", data);
            }
        }
    );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`));
