module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define("Roles", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        definition: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
    return Roles;
}
