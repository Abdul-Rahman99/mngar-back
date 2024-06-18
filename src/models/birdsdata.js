module.exports = (sequelize, DataTypes) => {
    const BirdsData = sequelize.define("BirdsData", {
        client_topic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    });
    BirdsData.associate = (models) => {
        BirdsData.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };

    return BirdsData;
}