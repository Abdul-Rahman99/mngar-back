module.exports = (sequelize, DataTypes) => {
    const User_Role = sequelize.define("User_Role", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles',
                key: 'id'
            }
        }
    });

    User_Role.associate = (models) => {
        User_Role.belongsTo(models.Users, { foreignKey: 'user_id' });
    };
    return User_Role;
};
