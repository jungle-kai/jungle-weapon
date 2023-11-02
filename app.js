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

/* just some change to test git */
// creating a local branch, making changes, committing
// one method is to checkout to local main, 'git pull origin main' to make updates, then to 'git merge local_branch_name' to local main
// another method : 'git push -u `local_branch_name`', effectively create a new branch in remote (for PR)