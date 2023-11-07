// models/index.js ; single centralized file for all meaningful exports

/* Create an instance of Sequelize ; a representation of the DB */
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
    process.env.DB_NAME,     // Database name in .env file
    process.env.DB_USER,     // Database username in .env file
    process.env.DB_PASSWORD, // Database password in .env file
    {
        host: process.env.DB_HOST, // Database host in .env file
        dialect: 'mysql',
    }
);

/* Import models */
const Member = require('./member')(sequelize);
const Post = require('./post')(sequelize);
const Comment = require('./comment')(sequelize);

/* Define associations */
Member.hasMany(Post, { foreignKey: 'memberID' }); // a member has many posts, tied by memberID FK
Post.belongsTo(Member, { foreignKey: 'memberID' }); // a post belongs to member, tied by memberID

Member.hasMany(Comment, { foreignKey: 'memberID' }); // a member has many comments, tied by memberID
Post.hasMany(Comment, { foreignKey: 'postID' }); // a post has many comments, tied by postID
Comment.belongsTo(Member, { foreignKey: 'memberID' }); // a comment belongs to member, tied by memberID
Comment.belongsTo(Post, { foreignKey: 'postID' }); // a comment belongs to post, tied by postID

/* Connect to Database */
const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('>>> DB Connection Successful.');

        // Sync all models with database
        await sequelize.sync();
        console.log('>>> DB Model Sync Successful.');

    } catch (error) {
        console.error('>>> Unable to connect to the database:', error);
    }
};

/* Finally, export all model-related variables and functions for use in app.js */
module.exports = {
    sequelize, // db instance
    connectToDatabase, // connector function
    Member, // member model
    Post, // post model
    Comment, // comment model
};
