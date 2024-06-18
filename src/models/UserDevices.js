module.exports = (sequelize, DataTypes) => {
    const UserDevices = sequelize.define("UserDevices", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
    UserDevices.associate = (models) => {
        UserDevices.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'id' });
        UserDevices.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return UserDevices;
}
