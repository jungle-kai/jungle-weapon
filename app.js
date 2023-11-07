/* Express & Swagger */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swaggerConfig');
const app = express();
const port = 3000;

/* (Depr.) Import Path module (a core Node.js module for path) */
// const path = require('path');
// The commented out section below would serve all static files from the "name" directory according to path, 
// starting from project root (denoted by __dirname) joined by 'name' (hence anything in the dist folder)
// app.use(express.static(path.join(__dirname, 'name'))); // left outside any app..() functions.

/* JWT Secret & DB Login data in .env */
require('dotenv').config();

/* MySQL Connection */
const { connectToDatabase } = require('./models');
connectToDatabase();

/* JSON middleware to handle body data (parsing etc) */
app.use(express.json()); // populate req.body

/* Cookie Parser middleware to handle login/logout cookies */
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // populate req.cookies

/* Serve static files from assets folder of root directory (image) */
app.use('/assets', express.static('assets'));

/* Placeholder Landing Page */
app.get('/', (req, res) => {
    res.send("Placeholder");
});

/* Swagger UI for api documentation */
var options = {
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { text-align: center; }
    #swagger-ui > section > div.swagger-ui > div:nth-child(2) > div.information-container.wrapper > section > div > div > div > div {
        background: url('/assets/ERD.png') no-repeat center center;
        background-size: 489px 324px;
        padding: 8em;
    }
    
    .swagger-ui .renderedMarkdown p {
        padding: 1em; 
        background-color: #fafafa;
        word-break: break-word;
        margin: 1em auto; 
    }
    `,
    customSiteTitle: "SWJ W12 Express.js Task API Documentation",
    customfavIcon: ""
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, options));

/* Use routes/index.js to access routers */
const { postsRoutes, commentsRoutes, membersRoutes } = require('./routes');
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/members', membersRoutes);

/* Start Server */
app.listen(port, '0.0.0.0', () => {
    console.log(`>>> Server running on port ${port}.`);
}).on('error', (error) => {
    console.error('>>> Failed to start server: ', error);
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