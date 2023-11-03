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
        default: Date.now, // try using moment.js or date-fns later (this is in m-secs)
        required: true
    },
    postTitle: {
        type: String,
        required: true
    },
    postAuthor: {
        type: String,
        required: true
    },
    postPassword: {
        type: String,
        required: true
    },
    postContent: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Post", postSchema);