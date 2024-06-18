module.exports = (sequelize, DataTypes) => {
    const SunriseSunset = sequelize.define("SunriseSunset", {
        sp_date: {
            type: DataTypes.DATE
        },
        sunrise: {
            type: DataTypes.STRING
        },
        sunset: {
            type: DataTypes.STRING
        }
    });
    return SunriseSunset;
}