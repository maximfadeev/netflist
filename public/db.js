const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

mongoose.model("User", UserSchema);

const db = require("../config/keys.js").MongoURI;

mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("MongoDB connected"))
    .catch((err) => console.log(err));

// module.exports = User;
