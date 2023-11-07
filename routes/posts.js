// routes/posts.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member, Post } = require("../models/index");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("./jwtAuth");

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 모든 포스트 조회 API
 *     description: 등록된 모든 포스트의 목록을 조회
 *     tags:
 *       - Posts
 *     responses:
 *       '200':
 *         description: 모든 포스트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 allPosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postID:
 *                         type: integer
 *                       postTitle:
 *                         type: string
 *                       postTime:
 *                         type: string
 *                         format: date-time
 *                       postAuthor:
 *                         type: string
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/", async (req, res) => {

    /* API to GET list of all posts */

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

/**
 * @swagger
 * /api/posts/{postID}:
 *   get:
 *     summary: 특정 단일 포스트 조회 API
 *     description: postID를 기반으로 한 개의 포스트 정보 조회
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *           default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         description: 조회할 포스트의 고유 식별 번호
 *     responses:
 *       '200':
 *         description: 포스트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 foundPost:
 *                   type: object
 *                   properties:
 *                     postTitle:
 *                       type: string
 *                     postAuthor:
 *                       type: string
 *                     postTime:
 *                       type: string
 *                       format: date-time
 *                     postContent:
 *                       type: string
 *       '404':
 *         description: 포스트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/:postID", async (req, res) => {

    /* API to GET one single existing post */

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

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 새로운 포스트 생성 API
 *     description: JWT 인증(로그인)을 통과한 사용자가 새 포스트를 생성하는데 활용
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postTitle:
 *                 type: string
 *                 default: 'some random title'
 *               postContent:
 *                 type: string
 *                 default: 'some random content for the post'
 *     responses:
 *       '201':
 *         description: 포스트 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newPost:
 *                   type: object
 *                   properties:
 *                     memberID:
 *                       type: string (UUID)
 *                     postID:
 *                       type: string (UUID)
 *                     postTime:
 *                       type: DATETIME
 *                       format: date-time
 *                     postTitle:
 *                       type: string
 *       '500':
 *         description: 서버 내부 오류로 인한 포스트 생성 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/", JWT_auth, async (req, res) => {

    /* API to POST one new post (Requires JWT_auth middleware authentication) */

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

/**
 * @swagger
 * /api/posts/{postID}:
 *   put:
 *     summary: 기존 포스트 업데이트 API
 *     description: JWT 인증(로그인)을 통과한 작성자가 자신의 포스트 내용을 업데이트하는데 사용
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *           default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         description: 업데이트할 포스트의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postContent:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 포스트 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 originalContent:
 *                   default: 'original text'
 *                 updatedContent:
 *                   default: 'new edited text'
 *       '401':
 *         description: 사용자 인증 실패 또는 포스트의 작성자가 아님
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '404':
 *         description: 포스트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '500':
 *         description: 서버 내부 오류로 인한 포스트 업데이트 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put("/:postID", JWT_auth, async (req, res) => {

    /* API to PUT (update) one existing post (Requires JWT_auth middleware authentication) */

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

/**
 * @swagger
 * /api/posts/{postID}:
 *   delete:
 *     summary: 기존 포스트 삭제 API
 *     description: JWT 인증을 통과한 작성자가 자신의 포스트를 삭제
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 포스트의 ID
 *     responses:
 *       '200':
 *         description: 포스트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deletedContent:
 *                   default: 'Deleted Text'
 *       '401':
 *         description: 사용자 인증 실패 또는 포스트의 작성자가 아님
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '404':
 *         description: 포스트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '500':
 *         description: 서버 내부 오류로 인한 포스트 삭제 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete("/:postID", JWT_auth, async (req, res) => {

    /* API to DELETE one existing post (Requires JWT_auth middleware authentication) */

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