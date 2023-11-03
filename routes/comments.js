/* Express */
const express = require('express');
const router = express.Router();

/* Import Schemas */
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const Member = require("../schemas/member");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("../middlewares/jwtAuth");

/* API to GET list of all comments on a post (Note: no API for single comments) */
router.get("/:postID", async (req, res) => {

    const { postID } = req.params;

    try {

        // First find the post using postID
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Find all comments that share the postID, and sort in descending order ; remove metadata
        const comments = await Comment.find({ postID }, '-_id -__v').sort({ commentTime: -1 }).lean();
        const commentContents = comments.map(comment => comment.commentContent); // return as array
        res.json({ success: true, comments_info: comments, comments_array: commentContents });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    };
});

/* API to POST a comment to a post (Requires JWT_auth middleware authentication) */
router.post("/:postID", JWT_auth, async (req, res) => {

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    }

    // Post-related preparations
    const { postID } = req.params;
    const commentAuthor = member.nickname;
    const { commentContent } = req.body;

    // Use trim() to remove whitespaces on each end, and check length to check for whitespaces
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {

        // First locate the post we are commenting on
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now add the comment and add user details as well
        const newComment = await Comment.create({ postID, commentAuthor, commentContent });

        // Respond with what was saved
        res.status(201).json({
            success: true, newComment: {
                postID: newComment.postID,
                commentID: newComment.commentID,
                commentTime: newComment.commentTime,
                commentAuthor: newComment.commentAuthor,
                commentContent: newComment.commentContent
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to POST comment" });
    };

});

/* API to PUT (update) one existing comment (Requires JWT_auth middleware authentication) */
router.put("/:postID/:commentID", JWT_auth, async (req, res) => { // require authentication before editing comment

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    }

    // Post edit preparations
    const nickname = member.nickname;
    const { postID, commentID } = req.params;
    const { commentContent } = req.body;

    // trim() to remove whitespaces on each end, and check length after that
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {

        // First find and verify that the post exists
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now locate the comment and verify that it exists
        const targetComment = await Comment.findOne({ commentID });
        if (!targetComment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Verify that the current user is the author of the comment
        if (nickname != targetComment.commentAuthor) {
            return res.status(401).json({ success: false, message: "You are not the author of this comment." });
        }

        // Update the comment (updateOne() requires use of $set to edit a specific column)
        const result = await Comment.updateOne({ commentID }, { $set: { commentContent } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Comment update failed." });
        };

        // Return result of operation to the client
        res.json({ success: true, message: "Comment was updated successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the comment." });
    };
});

/* API to DELETE one existing comment (Requires JWT_auth middleware authentication) */
router.delete("/:postID/:commentID", JWT_auth, async (req, res) => {

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    }

    // Post delete preparations
    const nickname = member.nickname;
    const { postID, commentID } = req.params;

    try {

        // First find and verify that the post exists
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now locate the comment and verify that it exists
        const targetComment = await Comment.findOne({ commentID });
        if (!targetComment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Verify that the user is the author of the comment
        if (nickname != targetComment.commentAuthor) {
            return res.status(401).json({ success: false, message: "You are not the author of this comment." });
        }

        // Now delete the post
        const result = await Comment.deleteOne({ commentID });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Comment does not exist." });
        }

        // Return result to client
        res.json({ success: true, message: "Comment was successfully deleted." })

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;