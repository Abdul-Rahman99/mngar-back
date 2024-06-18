module.exports = (sequelize, DataTypes) => {
    const FeedRunStatus = sequelize.define("FeedRunStatus", {

        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.INTEGER,
            defautValue: 1,
            allowNull: false
        },
    });
    FeedRunStatus.associate = (models) => {
        FeedRunStatus.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };

    return FeedRunStatus;
}