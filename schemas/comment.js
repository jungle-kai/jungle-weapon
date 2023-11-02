const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // UUID generator

const commentSchema = new mongoose.Schema({
    postID: {
        type: String,
        required: true,
    },
    commentID: {
        type: String, // UUID generator creates Strings.
        default: uuidv4, // UUID function
        required: true,
        unique: true
    },
    commentTime: {
        type: Date,
        default: Date.now, // try using moment.js or date-fns later (this is in m-secs)
        required: true
    },
    commentContent: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Comment", commentSchema);