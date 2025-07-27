// api/models/SignTemplate.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SignTemplate = sequelize.define('SignTemplate', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique ID for the document template'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Name of the template (e.g., "Leave Request Form")'
        },
        pdfUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Filename of the blank PDF template stored on the server'
        },
        fields: {
            type: DataTypes.JSON, // Stores an array of field objects
            allowNull: false,
            defaultValue: [],
            comment: 'JSON array of fields defined for the template (position, type, etc.)'
        },
        // createdAt, updatedAt will be added automatically by Sequelize
    }, {
        tableName: 'SignTemplates', // Explicit table name
        comment: 'Stores definitions for reusable document templates'
    });

    return SignTemplate;
};
