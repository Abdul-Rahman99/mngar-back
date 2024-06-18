module.exports = (sequelize, DataTypes) => {
    const Role_Permissions = sequelize.define("Role_Permissions", {
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles',
                key: 'id'
            }
        },
        perm_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Permissions',
                key: 'id'
            }
        }
    });
    return Role_Permissions;
};
