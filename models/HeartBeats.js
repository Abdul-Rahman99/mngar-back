module.exports = (sequelize, DataTypes) => {
    const HeartBeats = sequelize.define("HeartBeats", {
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    HeartBeats.associate = (models) => {
        HeartBeats.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return HeartBeats;
}