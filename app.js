const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const exphbs = require("express-handlebars");
require("./db");
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

// authentication
const ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in to view this resource");
    res.redirect("/login");
};

const ensureUnauthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard");
    } else {
        return next();
    }
};

//////////////////////////////////
//////////////////////////////////

app.get("/", (req, res) => {
    let user;
    if (req.user) {
        user = req.user.toJSON();
    }
    res.render("landing", { user });
});

app.get("/register", ensureUnauthenticated, (req, res) => {
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

app.get("/login", ensureUnauthenticated, (req, res) => {
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

app.get("/dashboard", ensureAuthenticated, (req, res) => {
    let user;
    if (req.user) {
        user = req.user.toJSON();
    }
    res.render("dashboard", { user });
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
    res.redirect(`edit/list/${newList.id}`);
});

app.get("/list/:listId", (req, res) => {
    List.findById(req.params.listId, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            data = data.toJSON();
            res.json(data);
        }
    });
});

app.get("/edit/list/:listId", (req, res) => {
    let user;
    if (req.user) {
        user = req.user.toJSON();
    }
    res.render("edit-list", { user });

    // List.findById(req.params.listId, function (err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         data = data.toJSON();
    //         res.render("edit-list", { data, dataString: JSON.stringify(data), user });
    //     }
    // });
});

app.post("/edit/list/:listId", (req, res) => {
    List.findOneAndUpdate(
        { _id: req.params.listId },
        {
            $push: {
                titles: req.body,
            },
        },
        function (err, data) {
            if (err) {
                console.log("err", err);
                res.send({ message: "error" });
            } else if (data === null) {
                console.log("no list exists");
                res.send({ message: "error" });
            } else {
                res.send({ message: "complete" });
            }
        }
    );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`));
