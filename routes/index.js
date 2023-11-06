// routes/index.js ; single central file for named routes used in app.js

const postsRoutes = require('./posts');
const commentsRoutes = require('./comments');
const membersRoutes = require('./members.js');

module.exports = {
    postsRoutes,
    commentsRoutes,
    membersRoutes
};
