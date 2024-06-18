module.exports = (sequelize, DataTypes) => {
    const FoodSchedules = sequelize.define("FoodSchedules", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER
        },
        feed_schedule: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feed_time: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feed_time_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "fixed"
        },
        feed_day: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
    });
    FoodSchedules.associate = (models) => {
        FoodSchedules.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };

    return FoodSchedules;
}