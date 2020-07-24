// const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");

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
app.engine("handlebars", exphbs({ handlebars: allowInsecurePrototypeAccess(Handlebars) }));
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
        res.redirect("/profile");
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
    // const lists = List.find({}).lean();
    // console.log(lists);
    List.find({}, function (err, lists) {
        if (err) console.log(err);
        // lists = JSON.parse(lists);
        console.log(lists);
        res.render("landing", { user, lists });
    });
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
        successRedirect: "/profile",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

// this is trash, make it better
app.get("/profile", ensureAuthenticated, (req, res) => {
    function asyncLoop(i, user, lists, callback) {
        if (user.lists.length === 0) {
            callback(user, []);
        } else {
            // this else is to delete empty lists
            const listId = user.lists[i]._id;
            List.findById(listId)
                .then((data) => {
                    data = data.toObject();
                    if (data.titles.length === 0) {
                        List.deleteOne({ _id: listId }, function (err) {
                            if (err) return handleError(err);
                            User.updateOne(
                                { _id: user._id },
                                { $pull: { lists: { $in: [listId] } } },
                                function (err) {
                                    if (err) return handleError(err);
                                }
                            );
                        });
                    } else {
                        lists.push(data);
                    }
                })
                .then(function () {
                    if (i + 1 < user.lists.length) {
                        asyncLoop(i + 1, user, lists, callback);
                    } else {
                        callback(user, lists);
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    let user;
    if (req.user) {
        user = req.user.toJSON();
    }
    asyncLoop(0, user, [], function (user, lists) {
        res.render("profile", { user, lists });
    });
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
            let user;
            if (req.user) {
                user = req.user.toJSON();
            }
            data = data.toJSON();
            console.log(data);
            res.render("list", { data, user });
        }
    });
});

app.get("/retrieve/list/:listId", (req, res) => {
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
});

app.delete("/delete/list/:listId", (req, res) => {
    const listId = req.params.listId;
    const userId = req.user._id;
    List.deleteOne({ _id: listId }, function (err) {
        if (err) return handleError(err);
        User.updateOne({ _id: userId }, { $pull: { lists: { $in: [listId] } } }, function (err) {
            if (err) return handleError(err);
            res.send({ message: "complete" });
        });
    });
});

app.post("/edit/list/:listId/changeName", (req, res) => {
    List.findOneAndUpdate(
        { _id: req.params.listId },
        {
            name: req.body.name,
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

app.post("/edit/list/:listId/addMovie", (req, res) => {
    List.findOneAndUpdate(
        { _id: req.params.listId },
        {
            $push: {
                titles: req.body.movie,
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

app.post("/edit/list/:listId/addEpisode", (req, res) => {
    List.findOneAndUpdate(
        { _id: req.params.listId, "titles.netflixId": req.body.show.netflixId },
        {
            $push: {
                "titles.$.episodes": req.body.episode,
            },
        },

        function (err, data) {
            if (err) {
                console.log("err", err);
                res.send({ message: "error" });
            } else if (data === null) {
                // in case show not in titles list
                List.findOneAndUpdate(
                    { _id: req.params.listId },
                    {
                        $push: {
                            titles: req.body.show,
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
                            List.findOneAndUpdate(
                                {
                                    _id: req.params.listId,
                                    "titles.netflixId": req.body.show.netflixId,
                                },
                                {
                                    $push: {
                                        "titles.$.episodes": req.body.episode,
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
                        }
                    }
                );
            } else {
                res.send({ message: "complete" });
            }
        }
    );
});

app.delete("/delete/:listId/:title", (req, res) => {
    const listId = req.params.listId;
    const delTitle = req.params.title;

    List.updateOne({ _id: listId }, { $pull: { titles: { netflixId: [delTitle] } } }, function (
        err
    ) {
        if (err) return handleError(err);
        res.send({ message: "complete" });
    });

    // List.deleteOne({ _id: listId }, function (err) {
    //     if (err) return handleError(err);
    //     User.updateOne({ _id: userId }, { $pull: { lists: { $in: [listId] } } }, function (err) {
    //         if (err) return handleError(err);
    //         res.send({ message: "complete" });
    //     });
    // });
});

app.delete("/delete/:listId/:title/:episode", (req, res) => {
    const listId = req.params.listId;
    const delTitle = req.params.title;
    const delEpisode = req.params.episode;

    List.findOne({ _id: listId }, function (err, list) {
        if (err) console.log(err);
        const listTitles = list.titles;
        let titleIndex;
        let episodeIndex;
        for (const [i, show] of listTitles.entries()) {
            if (show.netflixId.toString() === delTitle) {
                titleIndex = i;
                for (const [j, episode] of show.episodes.entries()) {
                    if (episode.netflixId.toString() === delEpisode) {
                        episodeIndex = j;
                        break;
                    }
                }
                break;
            }
        }
        list.titles[titleIndex].episodes.splice(episodeIndex, 1);
        list.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.send({ message: "complete" });
    });
});

// if (process.env.NODE_ENV === "production") {
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`));
