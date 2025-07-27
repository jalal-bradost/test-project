// api/models/DocumentCounter.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DocumentCounter = sequelize.define('DocumentCounter', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Primary key for the document counter'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Name of the counter (e.g., "signAppDocument")'
        },
        currentValue: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000, // Starting value for document numbers
            comment: 'The current highest document number'
        },
    }, {
        timestamps: false, // No need for createdAt/updatedAt for a counter
        tableName: 'DocumentCounters', // Explicit table name
        comment: 'Stores counters for auto-incrementing document numbers'
    });

    // Optional: Seed initial counter if it doesn't exist
    // This should ideally be part of your database migration or seeding script
    // For development, you can add it here, but remove for production or use migrations
    // DocumentCounter.findOrCreate({
    //     where: { name: 'signAppDocument' },
    //     defaults: { currentValue: 1000 }
    // }).then(() => {
    //     console.log('DocumentCounter for signAppDocument ensured.');
    // }).catch(err => {
    //     console.error('Error ensuring DocumentCounter:', err);
    // });

    return DocumentCounter;
};
