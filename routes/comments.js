/* Express */
const express = require('express');
const router = express.Router();

/* Import Schemas */
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");

/* API to GET list of all comments on a post */
router.get("/:postID", async (req, res) => {

    const { postID } = req.params;

    try {
        // first find the post
        const targetPost = await Post.findOne({ postID }); // UUID = String, and key:value are same
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // now find all comments of that postID and extract just the content; sort in descending order
        // use of lean() removes mongoose-related metadata before returning them to the client
        const comments = await Comment.find({ postID }, '-_id -__v').sort({ commentTime: -1 }).lean();
        const commentContents = comments.map(comment => comment.commentContent); // return as array
        res.json({ success: true, comments_info: comments, comments_array: commentContents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    }
});

/* API to POST a comment to a post */
router.post("/:postID", async (req, res) => {

    const { postID } = req.params;
    const { commentContent } = req.body;

    // trim() to remove whitespaces on each end, and check length after that
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {
        // first find the post
        const targetPost = await Post.findOne({ postID }); // UUID = String, and key:value are same
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // now add comment
        const newComment = await Comment.create({ postID, commentContent });
        res.status(201).json({ success: true, newComment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to POST comment" });
    };

});

/* API to PUT (update) one existing post */
router.put("/:postID/:commentID", async (req, res) => {

    const { postID, commentID } = req.params;
    const { commentContent } = req.body;

    // trim() to remove whitespaces on each end, and check length after that
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {
        // first find the post
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Check if the comment exists without retrieving the entire document
        const commentExists = await Comment.exists({ commentID });
        if (!commentExists) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // update the comment
        const result = await Comment.updateOne({ commentID }, { $set: { commentContent } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Comment update failed." });
        };

        // return result of operation to the client
        res.json({ success: true, message: "Comment was updated successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the comment." });
    };
});

/* API to DELETE one existing comment */
router.delete("/:postID/:commentID", async (req, res) => {

    const { postID, commentID } = req.params;
    // currently lacks authentication and softDelete (for recovery, mark as hidden)

    try {
        // first find the post
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // now delete the post
        const result = await Comment.deleteOne({ commentID });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Comment does not exist." });
        }

        // return result to client
        res.json({ success: true, message: "Comment was successfully deleted." })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;