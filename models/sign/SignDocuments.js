// api/models/SignDocument.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SignDocument = sequelize.define('SignDocument', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique ID for the signed document instance'
        },
        templateId: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID of the template this document was created from'
        },
        uploadedBy: {
            type: DataTypes.STRING, // Assuming userId is a string/UUID
            allowNull: false,
            comment: 'ID of the user who uploaded/created this document'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending', // e.g., 'pending', 'in_review', 'signed_by_hr', 'signed_by_gm', 'completed', 'rejected'
            comment: 'Current status of the document in the signing workflow'
        },
        pdfUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Filename of the filled/signed PDF document stored on the server'
        },
        fieldValues: {
            type: DataTypes.JSON, // Stores current values for text/date/docNumber fields
            allowNull: false,
            defaultValue: {},
            comment: 'JSON object storing values entered into the document fields'
        },
        signatures: {
            type: DataTypes.JSON, // Stores an array of signature objects { userId, fieldId, signedAt, signatureText, signerRole }
            allowNull: false,
            defaultValue: [],
            comment: 'JSON array of signatures applied to the document'
        },
        documentNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // Ensure document numbers are unique
            comment: 'Auto-incrementing unique number for the document'
        },
        // createdAt, updatedAt will be added automatically by Sequelize
    }, {
        tableName: 'SignDocuments', // Explicit table name
        comment: 'Stores instances of documents created from templates, with their data and signatures'
    });

    // You might define associations here, e.g.:
    // SignDocument.associate = (models) => {
    //     SignDocument.belongsTo(models.SignTemplate, { foreignKey: 'templateId', as: 'template' });
    //     // You might also associate with a User model if you have one
    // };

    return SignDocument;
};
