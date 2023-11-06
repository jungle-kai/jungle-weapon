// routes/posts.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member, Post } = require("../models/index");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("./jwtAuth");

/* API to GET list of all posts */
router.get("/", async (req, res) => {

    try {
        // Find all posts
        const posts = await Post.findAll({

            // given: memberID(FK), postID, postTitle, postContent, createdAt, updatedAt
            // select specific attributes of each post to return
            attributes: ['postID', 'postTitle', 'createdAt'],

            // include nickname by using model associations
            // each 'post' is tied to a user using belongsTo in models/index.js
            include: [{ model: Member, attributes: ['nickname'] }],

            // order based on createdAt, in DESCending order
            order: [['createdAt', 'DESC']]
        });

        // Each post representation in JSON is nested with "Member", so flatten & reorder it
        const flattenedPosts = posts.map(post => {
            return {
                postID: post.postID,
                postTime: post.createdAt,
                postAuthor: post.Member.nickname,
                postTitle: post.postTitle
            };
        });

        // Return the results
        res.json({ success: true, allPosts: flattenedPosts });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    }
});

/* API to GET one single existing post */
router.get("/:postID", async (req, res) => {

    // Dereference the http request parameter (path)
    const { postID } = req.params;

    try {
        // Find the target post using sequelize's find-by-primary-key
        const targetPost = await Post.findByPk(postID, {
            attributes: ['postTitle', 'postContent', 'createdAt'],
            include: [{ model: Member, attributes: ['nickname'] }]
            // 제목, 작성자명(nickname), 작성 날짜, 작성 내용
        });
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Flatten and reorganize the post
        const foundPost = {
            postTitle: targetPost.postTitle,
            postAuthor: targetPost.Member.nickname,
            postTime: targetPost.createdAt,
            postContent: targetPost.postContent
        };

        // Respond accordingly (order of targetPost elements are not designated)
        res.json({ success: true, foundPost });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error: Failed to GET requested post." })
    };
});

/* API to POST one new post (Requires JWT_auth middleware authentication) */
router.post("/", JWT_auth, async (req, res) => {

    // Since this code is executed after passing JWT_auth, the member ID definately exists.
    const memberID = req.user.userId;
    const { postTitle, postContent } = req.body;

    try {
        // Create a post using the three parameters (postID and createdAt are auto-generated)
        const newPost = await Post.create({ memberID, postTitle, postContent });
        res.status(201).json({
            success: true, newPost: {
                memberID: newPost.memberID, postID: newPost.postID,
                postTime: newPost.createdAt, postTitle: newPost.postTitle,
            } // to verify the result (memberID, postID, postTime, postTitle ; no content)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to POST new post." })
    };
});

/* API to PUT (update) one existing post (Requires JWT_auth middleware authentication) */
router.put("/:postID", JWT_auth, async (req, res) => {

    // Dereference http request data
    const memberID = req.user.userId;
    const { postID } = req.params;
    const { postContent } = req.body;

    try {
        // Find the post that we are looking to edit
        const targetPost = await Post.findByPk(postID);
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
        };

        // Verify that the current user is the author of the post
        // use !== strict equality operator and .toString() to be sure (uuidv4 type unsure)
        if (memberID !== targetPost.memberID.toString()) {
            return res.status(401).json({ success: false, message: "You are not the author of this post." });
        };

        // Store the original content before updating (for JSON response)
        const originalContent = {
            postTitle: targetPost.postTitle,
            postContent: targetPost.postContent
        };

        // Finally, update the post and respond
        const updatedPost = await targetPost.update({ postContent });
        res.json({
            success: true, originalContent, updatedContent: {
                postTitle: updatedPost.postTitle,
                postContent: updatedPost.postContent
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the post." });
    };
});

/* API to DELETE one existing post (Requires JWT_auth middleware authentication) */
router.delete("/:postID", JWT_auth, async (req, res) => {

    // Dereference the request
    const memberID = req.user.userId;
    const { postID } = req.params;

    try {
        // Find the post
        const targetPost = await Post.findByPk(postID);
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post does not exist." });
        };

        // Check ownership
        if (memberID !== targetPost.memberID.toString()) {
            return res.status(401).json({ success: false, message: "You are not the author of this post." });
        };

        // Store the original content before deleting (for JSON response)
        const deletedContent = {
            postTitle: targetPost.postTitle,
            postContent: targetPost.postContent
        };

        // Delete and respond
        await targetPost.destroy();
        res.json({ success: true, deletedContent });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;