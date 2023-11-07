// routes/index.js ; single central file for named routes used in app.js

const postsRoutes = require('./posts');
const commentsRoutes = require('./comments');
const membersRoutes = require('./members.js');

module.exports = {
    postsRoutes,
    commentsRoutes,
    membersRoutes
};

/**
 * @swagger
 * components:
 *   schemas:
 *     member:
 *       type: object
 *       properties:
 *         memberID:
 *           type: string (UUID)
 *           description: 사용자 식별 번호 (가입시 자동 생성 ; PK)
 *         nickname:
 *           type: string
 *           description: 사용자가 가입 시 기입한 Handle (변경 불가)
 *         password:
 *           type: string
 *           description: 사용자가 가입 시 설정한 비밀번호 (변경 불가)
 *     post:
 *       type: object
 *       properties:
 *         memberID:
 *           type: string (UUID)
 *           description: 사용자 식별 번호 (포스트 생성시 자동기입 ; FK)
 *         postID:
 *           type: string (UUID)
 *           description: 포스트 식별 번호 (포스트 생성시 자동생성 ; PK)
 *         postTitle:
 *           type: string
 *           description: 사용자가 포스트 작성 시 기입하는 포스트 제목
 *         postContent:
 *           type: string
 *           description: 사용자가 포스트 작성 시 기입하는 포스트 내용
 *         createdAt:
 *           type: DATETIME
 *           description: mySQL에서 entry 생성 시 자동으로 추가하는 포스트 생성 날짜/시간 (response에는 postTime으로 alias 변경)
 *         updatedAt:
 *           type: DATETIME
 *           description: mySQL에서 entry 생성 시 자동으로 추가, 이후 수정 시 업데이트하는 날짜/시간
 *     comment:
 *       type: object
 *       properties:
 *         memberID:
 *           type: string (UUID)
 *           description: 사용자 식별 번호 (댓글 생성시 자동기입 ; FK)
 *         postID:
 *           type: string (UUID)
 *           description: 포스트 식별 번호 (댓글 생성시 자동기입 ; FK)
 *         commentID:
 *           type: string (UUID)
 *           description: 댓글 식별 번호 (포스트 생성시 자동생성 ; PK)
 *         commentContent:
 *           type: string
 *           description: 사용자가 댓글 작성 시 기입하는 댓글 내용
 *         createdAt:
 *           type: DATETIME
 *           description: mySQL에서 entry 생성 시 자동으로 추가하는 포스트 생성 날짜/시간 (response에는 commentTime으로 alias 변경)
 *         updatedAt:
 *           type: DATETIME
 *           description: mySQL에서 entry 생성 시 자동으로 추가, 이후 수정 시 업데이트하는 날짜/시간
 */