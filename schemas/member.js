const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // UUID generator

const memberSchema = new mongoose.Schema({
    memberID: {
        type: String, // UUID generator creates Strings.
        default: uuidv4, // UUID function
        required: true,
        unique: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // try using bCrypt later (npm install bcrypt)
        required: true
    },
});

module.exports = mongoose.model("Member", memberSchema);