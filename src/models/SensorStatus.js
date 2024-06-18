module.exports = (sequelize, DataTypes) => {
    const SensorStatus = sequelize.define("SensorStatus", {
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    SensorStatus.associate = (models) => {
        SensorStatus.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return SensorStatus;
}