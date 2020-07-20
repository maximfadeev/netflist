const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    lists: [{ type: mongoose.ObjectId, ref: "List" }],
});

mongoose.model("User", UserSchema);

const ListSchema = new mongoose.Schema({
    name: { type: String, required: true, default: "untitled" },
    createdBy: { type: mongoose.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    titles: [
        {
            title: { type: String, required: true },
            netflixId: { type: Number, required: true },
            synopsis: { type: String, required: true },
            year: Number,
            type: { type: String, required: true },
            image: String,
            imdbid: Number,
            clist: [String],
            episodes: [
                {
                    title: String,
                    image: String,
                    season: String,
                    episode: String,
                    netflixId: Number,
                    synopsis: String,
                },
            ],
        },
    ],
});

mongoose.model("List", ListSchema);

const db = require("./config/keys.js").MongoURI;

mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("MongoDB connected"))
    .catch((err) => console.log(err));

// module.exports = User;
