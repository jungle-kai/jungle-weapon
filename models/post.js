// models/post.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        memberID: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Members', // Table, not model (we are dealing with associations within the model)
                key: 'memberID'
            } // foreign key (post belongsTo member)
        },
        postID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true
        },
        postTitle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postContent: {
            type: DataTypes.TEXT, // Use TEXT for potentially long content
            allowNull: false
        }
    }, {
        timestamps: true, // add createdAt, updatedAt to the model
        tableName: 'Posts'
    });

    return Post;
}
