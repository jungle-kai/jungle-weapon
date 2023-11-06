/* Express */
const express = require('express');
const app = express();
const port = 3000;

/* JWT Secret & DB Login data in .env */
require('dotenv').config();

/* MySQL Connection */
const { connectToDatabase } = require('./models');
connectToDatabase();

/* JSON middleware to handle body data (parsing etc) */
app.use(express.json());

/* Use routes/index.js to access routers */
const { postsRoutes, commentsRoutes, membersRoutes } = require('./routes');
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/members', membersRoutes);

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
// On the local, create a local branch, make changes. Once done, commit the code.
// (1) One way is to checkout to local main, 'git pull origin main' to update,
// then to 'git merge local_branch_name' and keep the local master as up to date as possible.
// We can then git push to remote master as we wish.
// (2) Second way is to simply `git push -u origin local_branch_name`, 
// which creates a new branch in remote -> PR Req to handle changes.
// In working with others, the second method makes most sense.