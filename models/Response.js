module.exports = (sequelize, DataTypes) => {
    const Response = sequelize.define("Response", {
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    Response.associate = (models) => {
        Response.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return Response;
}