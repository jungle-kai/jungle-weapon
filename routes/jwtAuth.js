// routes/jwtAuth.js ; a middleware to protect certain routes

const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    try {
        // http header -> authorization -> 'Bearer <token>'
        // looks something like -> Authorization: Bearer ag8w47awi4j...
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'No authentication token provided.' });
        }
        const token = req.headers.authorization.split(' ')[1];

        // verify the token using secret key in .env file
        // since members.js defines that jwt token only contains userId -> { userId: user.memberID }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // Attach the decoded token to the request object
        next(); // Proceed to the next middleware
    } catch (error) {
        // Handle the error if the token is invalid or not provided
        res.status(401).json({ message: 'Invalid or missing authentication. Please log in.' });
    }
};

module.exports = jwtMiddleware;
