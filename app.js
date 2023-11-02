/* Express */
const express = require('express');
const app = express();
const port = 3000;

/* Schema Connection */
const connect = require("./schemas");
connect();

/* JSON middleware to handle body data */
app.use(express.json());

/* Use routes/index.js to access routers */
const { postsRoutes, commentsRoutes } = require('./routes');
app.use('/posts', postsRoutes);
app.use('/comments', commentsRoutes);

// /* Declare and use the Posts Router (Middleware) */
// const postsRouter = require("./routes/posts");
// app.use("/posts", postsRouter);

// /* Declare and use the Comments Router (Middleware) */
// const commentsRouter = require("./routes/comments");
// app.use("/comments", commentsRouter);

/* Placeholder Landing Page */
app.get('/', (req, res) => {
    res.send('Placeholder for Homepage');
});

/* Start Server */
app.listen(port, () => {
    console.log(port, 'port open.');
});

/* (TEMP) Just some change to test git */
// Remote master and local master are clones of each other.
// On the local, create a local branch, make changes.
// Once done, commit the code.
// (1) One way is to checkout to local main, 'git pull origin main' to update,
// then to 'git merge local_branch_name' and keep the local master as up to date as possible.
// We can then git push to remote master as we wish.
// (2) Second way is to simply `git push -u local_branch_name`, which creates a new branch in remote (PR Req)

