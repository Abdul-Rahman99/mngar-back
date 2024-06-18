module.exports = (sequelize, DataTypes) => {
    const FeedingDone = sequelize.define("FeedingDone", {
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    FeedingDone.associate = (models) => {
        FeedingDone.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return FeedingDone;
}