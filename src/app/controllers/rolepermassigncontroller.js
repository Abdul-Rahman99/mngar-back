const models = require('../models');

const assignPerm = async (req, res) => {
    try {
        const { roleId, permId, status } = req.body;

        // Validate the incoming data
        if (!roleId || !permId || status === undefined) {
            return res.status(400).json({ status: false, message: 'Invalid request payload' });
        }

        // Convert status to a boolean (assuming it's sent as 0 or 1)
        const isChecked = status === 1;

        // Check if the user and role exist (you may want to perform additional validations)
        const permission = await models.Permissions.findByPk(permId);
        const role = await models.Roles.findByPk(roleId);

        if (!permission || !role) {
            return res.status(404).json({ status: false, message: 'Role or Permission not found' });
        }

        // Perform the logic to assign or unassign roles here
        if (isChecked) {
            await models.Role_Permissions.create({
                perm_id: permId,
                role_id: roleId,
            });
        } else {
            // If isChecked is false, remove the role from user_roles
            await models.Role_Permissions.destroy({
                where: {
                    perm_id: permId,
                    role_id: roleId,
                },
            });
        }

        const rolePermissions = await models.Role_Permissions.findAll({
            where: {
                role_id: roleId
            }
        });

        // Extract perm_ids from the rolePermissions result
        const permissionIds = rolePermissions.map(entry => entry.perm_id);

        // Respond with success
        // return res.status(200).json({ status: true, message: 'Role assigned/unassigned successfully' });
        const response = {
            status: true,
            message: 'Permission assigned/unassigned successfully',
            data: permissionIds.join(','), // Comma-separated IDs
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error assigning/unassigning role', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

const getRolePerms = async (req, res) => {
    try {
        const { roleId } = req.params;

        // Retrieve comma-separated perm_ids from Role_Permissions
        const rolePermissions = await models.Role_Permissions.findAll({
            where: {
                role_id: roleId
            }
        });

        // Extract perm_ids from the rolePermissions result
        const permissionIds = rolePermissions.map(entry => entry.perm_id);

        // Retrieve all permissions
        const allPermissions = await models.Permissions.findAll();

        const response = {
            status: true,
            permissionIds: permissionIds.join(','), // Comma-separated IDs
            data: allPermissions,
        };

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};




module.exports = {
    getRolePerms,
    assignPerm,
}