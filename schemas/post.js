const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // UUID generator

const postSchema = new mongoose.Schema({
    postID: {
        type: String, // UUID generator creates Strings.
        default: uuidv4, // UUID function
        required: true,
        unique: true
    },
    postTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    postAuthor: {
        type: String,
        required: true
    },
    postTitle: {
        type: String,
        required: true
    },
    postContent: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Post", postSchema);