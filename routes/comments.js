// routes/comments.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member, Post, Comment } = require("../models/index");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("./jwtAuth");

/* API to GET list of all comments on a post (Note: no API for single comments) */
router.get("/:postID", async (req, res) => {

    // Dereference the http request
    const { postID } = req.params;

    try {
        // First find the post using postID with Sequelize findOne method
        const targetPost = await Post.findOne({ where: { postID } });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
        };

        // Find all comments that share the postID, and sort in descending order of createdAt
        const comments = await Comment.findAll({
            where: { postID },
            attributes: ['memberID', 'postID', 'commentID', ['createdAt', 'commentTime'], 'commentContent'],
            order: [['createdAt', 'DESC']]
        });

        // Create an array with just the contents
        const commentContents = comments.map(comment => comment.commentContent);

        res.json({ success: true, comments, commentContents });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    };
});

/* API to POST a comment to a post (Requires JWT_auth middleware authentication) */
router.post("/:postID", JWT_auth, async (req, res) => {

    // Dereference the http request
    const memberID = req.user.userId;
    const { postID } = req.params;
    const { commentContent } = req.body;

    // Use trim() to remove whitespaces on each end, and check length to check for whitespaces
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {
        // First locate the post we are commenting on
        const targetPost = await Post.findOne({ where: { postID } });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now create a comment (commentID is auto generated)
        const newComment = await Comment.create({ memberID, postID, commentContent });

        // Respond with the saved result (change createdAt to commentTime)
        res.status(201).json({
            success: true, newComment: {
                memberID: newComment.memberID,
                postID: newComment.postID,
                commentID: newComment.commentID,
                commentTime: newComment.createdAt,
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

    // Dereference the http request 
    const memberID = req.user.userId;
    const { postID, commentID } = req.params;
    const { commentContent } = req.body;

    // trim() to remove whitespaces on each end, and check length after that
    if (!commentContent.trim().length) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty or just whitespace." });
    }

    try {
        // First find and verify that the post exists
        const targetPost = await Post.findByPk(postID)
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now locate the comment and verify that it exists
        const targetComment = await Comment.findByPk(commentID);
        if (!targetComment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Verify that the current user is the author of the comment
        if (memberID !== targetComment.memberID.toString()) {
            return res.status(401).json({ success: false, message: "You are not the author of this comment." });
        }

        // Store the original content before updating (for JSON response)
        const originalContent = {
            commentContent: targetComment.commentContent,
        };

        // Finally, update the post and respond
        const updatedComment = await targetComment.update({ commentContent });
        if (!updatedComment) {
            return res.status(404).json({ success: false, message: "Failed to update comment. Please contact Admin." });
        }

        res.json({
            success: true, originalContent, updatedContent: {
                commentContent: updatedComment.commentContent
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the comment." });
    };
});

/* API to DELETE one existing comment (Requires JWT_auth middleware authentication) */
router.delete("/:postID/:commentID", JWT_auth, async (req, res) => {

    // Dereference the http request
    const memberID = req.user.userId;
    const { postID, commentID } = req.params;

    try {
        // First find and verify that the post exists
        const targetPost = await Post.findByPk(postID)
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Now locate the comment and verify that it exists
        const targetComment = await Comment.findByPk(commentID);
        if (!targetComment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Verify that the current user is the author of the comment
        if (memberID !== targetComment.memberID.toString()) {
            return res.status(401).json({ success: false, message: "You are not the author of this comment." });
        }

        // Store the original content before deleting (for JSON response)
        const deletedContent = {
            commentContent: targetComment.commentContent,
        };

        // Delete and respond
        const deleted = await targetComment.destroy();
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Failed to delete. Please contact Admin." });
        }
        res.json({ success: true, deletedContent });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;