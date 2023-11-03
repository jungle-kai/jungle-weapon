/* Express */
const express = require('express');
const router = express.Router();

/* Import Schemas */
const Post = require("../schemas/post");
const Member = require("../schemas/member");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("../middlewares/jwtAuth");

/* API to GET list of all posts */
router.get("/", async (req, res) => {

    try {

        // Find all posts, and select specific attributes only ; Sort in descending order, and remove metadata (convert to object)
        const posts = await Post.find().select('postID postTime postTitle postAuthor -_id').sort({ postTime: -1 }).lean();
        res.json({ success: true, allPosts: posts });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    }
});

/* API to GET one single existing post */
router.get("/:postID", async (req, res) => {

    const { postID } = req.params;

    try {

        // Find the target post, but without _id and __v elements ; remove mongoose metadata
        const targetPost = await Post.findOne({ postID }).select('-_id -__v').lean();
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Respond accordingly (order of targetPost elements are not designated)
        res.json({ success: true, foundPost: targetPost });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error: Failed to GET requested post." })
    };
});

/* API to POST one new post (Requires JWT_auth middleware authentication) */
router.post("/", JWT_auth, async (req, res) => {

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    }

    // Post creation preparations
    const postAuthor = member.nickname;
    const { postTitle, postContent } = req.body;

    try {

        // Create post using three elements
        const newPost = await Post.create({ postAuthor, postTitle, postContent });

        // Give response to client (postID and postTime are auto generated at schemas.js)
        res.status(201).json({
            success: true, newPost: {
                postID: newPost.postID, postTime: newPost.postTime,
                postAuthor: newPost.postAuthor, postTitle: newPost.postTitle, postContent: newPost.postContent
            }
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to POST new post." })

    };
});

/* API to PUT (update) one existing post (Requires JWT_auth middleware authentication) */
router.put("/:postID", JWT_auth, async (req, res) => {

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    };

    // Post PUT(edit) preparations
    const nickname = member.nickname;
    const { postID } = req.params;
    const { postContent } = req.body; // should change as we implement bcrypt

    try {

        // Find the post that we are looking to edit
        const foundPost = await Post.findOne({ postID });
        if (!foundPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
        };

        // Verify that the current user is the author of the post
        if (nickname != foundPost.postAuthor) {
            return res.status(401).json({ success: false, message: "You are not the author of this post." });
        };

        // Finally, update the post and respond (updateOne() requires use of $set)
        await Post.updateOne({ postID }, { $set: { postContent } });
        res.json({ success: true, message: "Post was updated successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the post." });
    };
});

/* API to DELETE one existing post (Requires JWT_auth middleware authentication) */
router.delete("/:postID", JWT_auth, async (req, res) => {

    // Authentication and req.user extraction
    const memberID = req.user.userId;
    const member = await Member.findOne({ memberID });
    if (!member) {
        return res.status(404).json({ success: false, message: 'An error with your login credentials. Please contact Admin.' });
    }

    // Post deletion preparations
    const nickname = member.nickname;
    const { postID } = req.params;

    try { // in the future, look to add soft-delete features for recover (marking as hidden)

        // Find the post that we are looking to delete
        const targetPost = await Post.findOne({ postID });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post does not exist." });
        };

        // Verify that the current user is the author of the post
        if (nickname != targetPost.postAuthor) {
            return res.status(401).json({ success: false, message: "You are not the author of this post." });
        };

        // Finally, delete the post and respond with the result
        const result = await Post.deleteOne({ postID });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Delete Failed." });
        }
        res.json({ success: true, message: "Post was successfully deleted." })

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;