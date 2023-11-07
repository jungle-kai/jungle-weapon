// routes/comments.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member, Post, Comment } = require("../models/index");

/* Import JWT Authorization Middleware */
const jwt = require('jsonwebtoken');
const JWT_auth = require("./jwtAuth");

/**
 * @swagger
 * /api/comments/{postID}/:
 *   get:
 *     summary: 포스트 단위로 모든 코멘트 조회 API
 *     description: 특정 포스트에 종속된 모든 코멘트들을 한번에 조회
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         description: 탐색할 포스트의 고유 식별 번호
 *         default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 모든 코멘트 탐색 및 리턴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 comments:
 *                   type: array
 *                   description: 각 코멘트 단위로 세부 정보 표시
 *                 commentContents:
 *                   type: array
 *                   description: 코멘트 본문만을 추출해서 배열로 제공
 *                   items:
 *                     type: string
 *       '404':
 *         description: 포스트를 찾을 수 없을 경우
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 */
router.get("/:postID", async (req, res) => {

    /* API to GET list of all comments on a post (Note: no API for single comments) */

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

/**
 * @swagger
 * /api/comments/{postID}/{commentID}:
 *   get:
 *     summary: 특정 단일 코멘트 조회 API
 *     description: postID 및 commentID를 기반으로 한 개의 코멘트 정보 조회
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         description: 조회할 코멘트가 소속된 포스트의 고유 식별 번호
 *       - in: path
 *         name: commentID
 *         required: true
 *         schema:
 *           type: string
 *         default: '6215ba7d-c5ba-42a9-9da5-f426018832c0'
 *         description: 조회할 댓글의 고유 식별 번호
 *     responses:
 *       '200':
 *         description: 코멘트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 foundComment:
 *                   type: object
 *                   properties:
 *                     memberID:
 *                       type: string (UUID)
 *                     postID:
 *                       type: string (UUID)
 *                     commentID:
 *                       type: string (UUID)
 *                     commentTime:
 *                       type: DATETIME
 *                       format: date-time
 *                     commentContent:
 *                       type: string
 *       '404':
 *         description: 포스트 또는 댓글을 찾을 수 없음
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
router.get("/:postID/:commentID", async (req, res) => {

    /* API to GET one single existing comment */

    // Dereference the http request parameter (path)
    const { postID, commentID } = req.params;

    try {
        // Find the target post using sequelize's find-by-primary-key
        const targetPost = await Post.findByPk(postID);
        if (!targetPost) {
            return res.status(404).json({ success: false, message: "Post not found." })
        };

        // Find the target comment using sequelize's find-by-primary-key
        const foundComment = await Comment.findByPk(commentID, {
            attributes: ['memberID', 'postID', 'commentID', ['createdAt', 'commentTime'], 'commentContent']
        });
        if (!foundComment) {
            return res.status(404).json({ success: false, message: "Comment not found." })
        };

        // Respond accordingly (order of targetPost elements are not designated)
        res.json({ success: true, foundComment });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error: Failed to GET requested comment." })
    };
});

/**
 * @swagger
 * /api/comments/{postID}/:
 *   post:
 *     summary: 지정한 포스트에 댓글을 새로 생성하는 API
 *     description: JWT 인증(로그인)이 완료된 사용자에 한해 제공
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         description: 댓글을 달고자 하는 포스트의 고유 식별 번호
 *         default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentContent
 *             properties:
 *               commentContent:
 *                 type: string
 *                 description: 작성하고자 하는 댓글 내용 (Content)
 *     responses:
 *       '201':
 *         description: 댓글 생성 성공
 *       '400':
 *         description: 공백만으로 구성된 댓글의 경우 불허
 *       '404':
 *         description: 목표로 하는 포스트를 찾을 수 없을 경우
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 *     security:
 *       - BearerAuth: []
 */
router.post("/:postID", JWT_auth, async (req, res) => {

    /* API to POST a comment to a post (Requires JWT_auth middleware authentication) */

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

/**
 * @swagger
 * /api/comments/{postID}/{commentID}:
 *   put:
 *     summary: 직접 작성한 댓글을 수정하는 API
 *     description: 댓글의 작성자가 본인이어야 수정 가능하도록 설계
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         description: 수정하고자 하는 댓글이 소속된 포스트의 고유 식별 번호
 *         default: '8d57d421-d5b4-4a03-b1db-c8dd1fdb6b8c'
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentID
 *         required: true
 *         description: 수정하고자 하는 댓글의 고유 식별 번호
 *         default: '6215ba7d-c5ba-42a9-9da5-f426018832c0'
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentContent
 *             properties:
 *               commentContent:
 *                 type: string
 *                 description: 수정하고자 하는 내용 (Content)
 *     responses:
 *       '200':
 *         description: 댓글 수정 성공
 *       '400':
 *         description: 수정하려는 내용이 없거나, 공백으로만 이루어진 경우
 *       '401':
 *         description: 수정하려는 댓글의 작성자가 아닐 경우
 *       '404':
 *         description: 목표로 하는 포스트 또는 댓글을 찾을 수 없는 경우
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 *     security:
 *       - BearerAuth: []
 */
router.put("/:postID/:commentID", JWT_auth, async (req, res) => {

    /* API to PUT (update) one existing comment (Requires JWT_auth middleware authentication) */

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

/**
 * @swagger
 * /api/comments/{postID}/{commentID}:
 *   delete:
 *     summary: 직접 작성한 단일 댓글을 삭제하는 API
 *     description: 본인이 작성한 댓글에 한정하여 삭제 가능하도록 구현
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         description: 삭제하고자 하는 댓글이 종속된 포스트의 고유 식별 번호
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentID
 *         required: true
 *         description: 삭제하고자 하는 댓글의 고유 식별 번호
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 댓글 삭제 성공
 *       '401':
 *         description: 삭제하려는 댓글의 작성자가 아닌 경우
 *       '404':
 *         description: 목표로 하는 포스트 또는 댓글을 찾을 수 없는 경우
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 *     security:
 *       - BearerAuth: []
 */
router.delete("/:postID/:commentID", JWT_auth, async (req, res) => {

    /* API to DELETE one existing comment (Requires JWT_auth middleware authentication) */

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