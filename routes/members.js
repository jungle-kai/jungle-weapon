// routes/members.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member, Post, Comment, sequelize } = require("../models/index");

/* Password Protection */
const bcrypt = require('bcrypt');
const saltRounds = 10; // change for higher/lower security requirement

/* Login Protection (JWT) */
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // JWT Secret Key in .env file (excluded from git)
const JWT_auth = require("./jwtAuth"); // import authorization middleware

/* Function to check validity of registration request */
function join_validity_check(nickname, password, password_check) {

    // Return error messages if condition is triggered
    const regex = /^[A-Za-z0-9]{3,}$/;
    if (!regex.test(nickname)) {
        return "Nickname must be at least 3 characters long and contain only alphanumeric characters.";
    }
    if (password.length < 4) {
        return "Password must be at least 4 characters long.";
    }
    if (password.includes(nickname)) {
        return "Password cannot include the nickname.";
    }
    if (password !== password_check) {
        return "Passwords do not match.";
    }

    return null; // null indicates no errors
}

/**
 * @swagger
 * /api/members/register:
 *   post:
 *     summary: 신규 회원 가입 API
 *     description: bcrypt; 닉네임 + 비밀번호 외에 추후 확장 가능 (client-side hashing + http 도입 필요)
 *     tags:
 *       - Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 pattern: '^[A-Za-z0-9]{3,}$'
 *                 minLength: 3
 *                 maxLength: 10
 *                 description: 3자 이상의 Alphanumeric 닉네임
 *               password:
 *                 type: string
 *                 minLength: 4
 *                 description: 4자 이상의 비밀번호
 *               password_check:
 *                 type: string
 *                 minLength: 4
 *                 description: 비밀번호 교차 검증 목적
 *     responses:
 *       '200':
 *         description: 유저 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newMember:
 *                   type: object
 *                   properties:
 *                     memberID:
 *                       type: uuid
 *                     nickname:
 *                       type: string
 *       "400":
 *         description: 닉네임 또는 비밀번호 검증 실패 (기입 조건 재확인 필요)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       "409":
 *         description: 이미 등록된 닉네임일 경우 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       "500":
 *         description: 알 수 없는 오류 (Admin 확인 요청 필요)
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
router.post('/register', async (req, res) => {
    /* API to register as a member (POST) */

    // Dereference input from the http request body
    const { nickname, password, password_check } = req.body;

    // Verify that the entries are valid
    const validationError = join_validity_check(nickname, password, password_check);
    if (validationError) {
        res.status(400).json({ success: false, message: validationError });

    } else {

        try {
            // Verify that the name is not taken
            const namecheck = await Member.findOne({ where: { nickname } });
            if (namecheck) {
                return res.status(409).json({ success: false, message: "Nickname Exists" });
            };

            // Hash the password entry and create membership
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newMember = await Member.create({ nickname, password: hashedPassword });

            // Return result to the user (include memberID ; PK to that model)
            res.status(201).json({ success: true, newMember: { memberID: newMember.memberID, nickname: newMember.nickname } });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error : Registration Failed." });
        };
    };
});

/**
 * @swagger
 * /api/members/login:
 *   post:
 *     summary: 회원 로그인 API
 *     description: bCrypt; 닉네임과 비밀번호를 이용하여 로그인 (encrypt된 비밀번호를 비교하는 방식)
 *     tags:
 *       - Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *               - password
 *             properties:
 *               nickname:
 *                 type: string
 *                 default: 'testaccount'
 *                 description: 로그인에 사용되는 사용자 Nickname
 *               password:
 *                 type: string
 *                 default: 'testpassword'
 *                 description: Nickname과 매칭되는 사용자 비밀번호
 *     responses:
 *       '200':
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             description: JWT 토큰이 포함된 쿠키를 설정합니다. HttpOnly ; default 1H
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '401':
 *         description: 닉네임 또는 비밀번호 오류로 인한 인증 실패
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
 *         description: 서버 내부 오류로 인한 로그인 실패
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
router.post('/login', async (req, res) => {
    /* API to Login */

    // Dereference input from http request body
    const { nickname, password } = req.body;

    try {
        // Find the user by nickname
        const user = await Member.findOne({ where: { nickname } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Check your nickname and password again." });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Check your nickname and password again." });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.memberID }, // memberID is the PK of the Member model
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send the JWT in a cookie
        res.cookie('swj12_express_token', token, { httpOnly: true })
            .json({ success: true, token, message: "TEMPORARY PROVISION FOR DEBUGGING/PRESENTATIONAL PURPOSES" });
        // to replace token with a success message at production level to avoid providing key

        // Later with https (secure flag)
        // res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Login Failed." });
    }
});

/**
 * @swagger
 * /api/members/logout:
 *   post:
 *     summary: 회원 로그아웃 API
 *     description: clearCookie; Client가 JWT Token을 삭제하도록 하는 기초적인 기능
 *     tags:
 *       - Members
 *     requestBody:
 *       required: false
 *     responses:
 *       '200':
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '400':
 *         description: 토큰을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *     security:
 *       - BearerAuth: []
 */
router.post('/logout', JWT_auth, (req, res) => {

    /* API to logout */

    // Cookie named 'swj12_express_token' is named and issued at login
    // Check if the cookie with the name 'express_login_token' exists
    if (req.cookies && req.cookies.swj12_express_token) {
        res.clearCookie('swj12_express_token');
        res.json({ success: true, message: "Logged out successfully." });
        res.redirect('/');
    } else {
        res.status(400).json({ success: false, message: "No active session." });
    };
});

/**
 * @swagger
 * /api/members/purge:
 *   delete:
 *     summary: 플랫픔에서 모든 글을 지우고 회원 탈퇴하는 API
 *     description: |
 *       Transaction/Atomic; 본인이 작성한 모든 포스트와 댓글 삭제 후 계정 삭제 (복구 불가)
 *       
 *       SWJ 공유 목적의 실제 코드 (production이라면 공유 X):
 *       
 *       ```javascript
 *       router.delete('/purge', JWT_auth, async (req, res) => {
 *
 *           // (1) JWT 미들웨어에서 저장한 req.user를 활용해서 현 유저의 memberID 추출
 *           const memberID = req.user.userId;
 *
 *           try {
 *               // (2) 아토믹한 Transaction을 시작 (실패 시 원복, 하나의 실행 단위)
 *               const result = await sequelize.transaction(async (t) => {
 *
 *                   // (3) 모든 코멘트를 찾고, 코멘트의 내용만 추출 (transaction t 이내에)
 *                   const comments = await Comment.findAll({
 *                       where: { memberID },
 *                       attributes: ['commentContent'],
 *                       transaction: t
 *                   });
 *
 *                   // (4) 찾은 코멘트의 수, 그리고 개별 내용을 배열에 매핑 (map)
 *                   const numCommentsDeleted = comments.length;
 *                   const delCommentContents = comments.map(c => c.commentContent);
 *
 *                   // (5) 찾은 코멘트들 전부 삭제
 *                   await Comment.destroy({
 *                       where: { memberID },
 *                       transaction: t
 *                   });
 *
 *                   // (6) memberID가 같은 모든 포스트를 찾기
 *                   const posts = await Post.findAll({
 *                       where: { memberID },
 *                       attributes: ['postTitle'],
 *                       transaction: t
 *                   });
 *
 *                   // (7) 코멘트와 마찬가지로 그 숫자, 그리고 이 경우에는 제목을 백업
 *                   const numPostsDeleted = posts.length;
 *                   const delPostTitles = posts.map(p => p.postTitle);
 *
 *                   // (8) 포스트 삭제
 *                   await Post.destroy({
 *                       where: { memberID },
 *                       transaction: t
 *                   });
 *
 *                   // (9) 계정 삭제
 *                   await Member.destroy({
 *                       where: { memberID },
 *                       transaction: t
 *                   });
 *
 *                   // (10) 여기까지 왔다면 성공한 것으로 보고 백업해둔 결과들 반환 (transaction의 결과)
 *                   return { numPostsDeleted, delPostTitles, numCommentsDeleted, delCommentContents };
 *               });
 *
 *               // (11) Transaction의 결과물을 포맷 변환하여 리턴
 *               res.json({
 *                   success: true,
 *                   message: 'User and all related posts and comments have been deleted.',
 *                   data: {
 *                       numCommentsDeleted: result.numCommentsDeleted,
 *                       commentContents: result.delPostTitles,
 *                       numPostsDeleted: result.numPostsDeleted,
 *                       postTitles: result.delCommentContents
 *                   }
 *               });
 * 
 *           } catch (error) {
 *               console.error(error);
 *               // If the transaction fails, nothing will be deleted
 *               res.status(500).json({ success: false, message: 'Failed to delete user and related data.' });
 *           }
 *
 *       });
 *       ```
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 전체 삭제 및 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     numPostsDeleted:
 *                       type: integer
 *                       description: 삭제된 포스트 수
 *                     delPostTitles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 삭제된 포스트 제목
 *                     numCommentsDeleted:
 *                       type: integer
 *                       description: 삭제된 댓글 수
 *                     delCommentContents:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 삭제된 댓글 내용
 *       '500':
 *         description: 서버 내부 오류로 인한 조회 실패
 */
router.delete('/purge', JWT_auth, async (req, res) => {

    /* API to basically delete all posts and comments made by user, then delete itself */

    // Dereference the member information
    const memberID = req.user.userId;

    try {
        // Start a transaction (Atomic, reversible if error)
        const result = await sequelize.transaction(async (t) => {

            // Retrieve and count comments
            const comments = await Comment.findAll({
                where: { memberID },
                attributes: ['commentContent'],
                transaction: t
            });

            // Count number of comments to delete and backup comments
            const numCommentsDeleted = comments.length;
            const delCommentContents = comments.map(c => c.commentContent);

            // Delete comments
            await Comment.destroy({
                where: { memberID },
                transaction: t
            });

            // Retrieve and count posts with titles
            const posts = await Post.findAll({
                where: { memberID },
                attributes: ['postTitle'],
                transaction: t
            });

            // Count number of posts to delete and backup their titles
            const numPostsDeleted = posts.length;
            const delPostTitles = posts.map(p => p.postTitle);

            // Delete posts
            await Post.destroy({
                where: { memberID },
                transaction: t
            });

            // Delete the user account
            await Member.destroy({
                where: { memberID },
                transaction: t
            });

            // If everything went well, resolve the transaction
            return { numPostsDeleted, delPostTitles, numCommentsDeleted, delCommentContents };
        });

        // Transaction has been committed
        // result contains the counts and data from deleted records
        res.json({
            success: true,
            message: 'User and all related posts and comments have been deleted.',
            data: {
                numCommentsDeleted: result.numCommentsDeleted,
                commentContents: result.delPostTitles,
                numPostsDeleted: result.numPostsDeleted,
                postTitles: result.delCommentContents
            }
        });
    } catch (error) {
        console.error(error);
        // If the transaction fails, nothing will be deleted
        res.status(500).json({ success: false, message: 'Failed to delete user and related data.' });
    }

});

/* Export router */
module.exports = router;