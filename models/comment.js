// models/comment.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        memberID: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Members', // Tablel name, not model name
                key: 'memberID',
            } // foreign key (comment belongsTo member)
        },
        postID: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Posts',
                key: 'postID',
            } // foreign key (comment belongsTO post)
        },
        commentID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true
        },
        commentContent: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        // Model options
        timestamps: true, // add createdAt, updatedAt to the model
        tableName: 'Comments'
    });

    return Comment;
}
