/* Express */
const express = require('express');
const router = express.Router();

/* Import Schemas */
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");

/* API to GET list of all posts */
router.get("/", async (req, res) => {

    try {
        // find, select, sort in descending order, remove mongoose metadata (convert to plain javascript obj)
        const posts = await Post.find().select('postID postTitle postAuthor postTime -_id').sort({ postTime: -1 }).lean();
        res.json({ success: true, allPosts: posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to GET list of posts." })
    }
});

/* API to POST one new post */
router.post("/", async (req, res) => {

    const { postTitle, postAuthor, postPassword, postContent } = req.body;

    try {
        const newPost = await Post.create({ postTitle, postAuthor, postPassword, postContent });
        // mongoose create() creates and saves to db, but the lack of explicit save() does not trigger the pre-save hook.
        // const newPost = new Post({ postTitle, postAuthor, postPassword, postContent });
        // const savedPost = await newPost.save();
        res.status(201).json({ success: true, newPost: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to POST new post." })
    };
});

/* API to GET one existing post */
router.get("/:postID", async (req, res) => {

    const { postID } = req.params;

    try {
        const targetPost = await Post.findOne({ postID }).select('-_id -__v').lean(); // UUID = String, and key:value are same
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };
        res.json({ success: true, foundPost: targetPost });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error: Failed to GET requested post." })
    };
});

/* API to PUT (update) one existing post */
router.put("/:postID", async (req, res) => {

    const { postID } = req.params;
    const { postPassword, postContent } = req.body; // should change as we implement bcrypt

    try {
        // first find the post
        const foundPost = await Post.findOne({ postID });
        if (!foundPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
        };

        // now verify the password
        if (postPassword != foundPost.postPassword) { // should change as we implement bcrypt
            return res.status(401).json({ success: false, message: "Password does not match." });
        };

        // and finally update the post as password was matched
        await Post.updateOne({ postID }, { $set: { postContent } });
        res.json({ success: true, message: "Post was updated successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to PUT (update) the post." });
    };
});

/* API to DELETE one existing post */
router.delete("/:postID", async (req, res) => {

    const { postID } = req.params;

    try { // currently lacks authentication and softDelete (for recovery, mark as hidden)
        const result = await Post.deleteOne({ postID });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Post does not exist." });
        }
        res.json({ success: true, message: "Post was successfully deleted." })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Failed to DELETE the post." });
    };
});

/* Export router */
module.exports = router;