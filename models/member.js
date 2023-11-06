// models/member.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Member = sequelize.define('Member', {
        memberID: {
            type: DataTypes.UUID, // Sequelize data type for UUID
            defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
            primaryKey: true // used in posts & comments as ...authorID
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // nicknames must be unique in the table
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false, // no need for createdAt, updatedAt
        tableName: 'Members'
    });

    return Member;
};