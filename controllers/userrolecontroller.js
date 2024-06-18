const models = require('../models');

const assignRole = async (req, res) => {
    try {
        const { userId, roleId, status } = req.body;

        // Validate the incoming data
        if (!userId || !roleId || status === undefined) {
            return res.status(400).json({ status: false, message: 'Invalid request payload' });
        }

        // Convert status to a boolean (assuming it's sent as 0 or 1)
        const isChecked = status === 1;

        // Check if the user and role exist (you may want to perform additional validations)
        const user = await models.Users.findByPk(userId);
        const role = await models.Roles.findByPk(roleId);

        if (!user || !role) {
            return res.status(404).json({ status: false, message: 'User or role not found' });
        }

        // Perform the logic to assign or unassign roles here
        if (isChecked) {
            // If isChecked is true, delete previous records and insert a new one
            // await models.User_Role.destroy({
            //     where: {
            //         user_id: userId,
            //     },
            // });
            await models.User_Role.create({
                user_id: userId,
                role_id: roleId,
            });
        } else {
            // If isChecked is false, remove the role from user_roles
            await models.User_Role.destroy({
                where: {
                    user_id: userId,
                    role_id: roleId,
                },
            });
        }

        // Respond with success
        return res.status(200).json({ status: true, message: 'Role assigned/unassigned successfully' });

    } catch (error) {
        console.error('Error assigning/unassigning role', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

const getUserRole = async (req, res) => {
    try {
        const usersWithRoles = await models.Users.findAll({
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                [models.sequelize.fn('GROUP_CONCAT', models.sequelize.col('Roles.role_id')), 'role_ids']
            ],
            include: [
                {
                    model: models.User_Role,
                    as: 'Roles',
                    attributes: [],
                    required: false,
                }
            ],
            group: ['Users.id'],
        });

        const Roles = await models.Roles.findAll();

        const response = {
            "status": true,
            "Users": usersWithRoles,
            "Roles": Roles,
        };

        if (usersWithRoles) {
            res.status(200).json(response);
        } else {
            res.status(200).json({ "status": false, 'Users': 'No Record found' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ "status": false, 'Users': 'Internal Server Error' });
    }
}


module.exports = {
    getUserRole,
    assignRole,
}