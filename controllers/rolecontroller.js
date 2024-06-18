
const models = require('../models');

const addRole = async (req, res) => {
    try {
        const { id, isNew, name, definition } = req.body;

        if (!name || !definition) {
            return res.status(400).send("Both name and definition are required");
        }

        let role;

        if (isNew) {
            const existingRole = await models.Roles.findOne({ where: { name } });

            if (existingRole) {
                return res.status(409).send("Role Already Exists");
            }

            role = await models.Roles.create({
                name,
                definition
            });
        } else {
            const updatedRole = await models.Roles.update(
                { name, definition },
                { where: { id } }
            );

            if (updatedRole[0] === 0) {
                return res.status(404).send("Role not found");
            }

            role = await models.Roles.findByPk(id);
        }

        const response = {
            status: true,
            data: role
        };

        res.status(200).send(response);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
};

const getRoles = async (req, res) => {
    try {
        const Roles = await models.Roles.findAll();

        const response = {
            "status": true,
            "data": Roles
        };

        if (Roles) {
            res.status(200).json(response);
        } else {
            res.status(200).json({ "status": false, 'data': 'No role found' });
        }

    } catch (err) {
        console.log(err);
        res.status(200).json({ "status": false, 'data': 'No role found' });
    }


}
const updateRole = async (req, res) => {
    try {

        const { id, status } = req.body;

        let Roles;

        Roles = await models.Roles.update({

            status: status
        }, {
            where: {
                id: id,
            },
        });

        const response = {
            "status": true,
            "data": Roles
        };
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}

const deleteRole = async (req, res) => {
    try {

        await models.Roles.destroy({
            where: {
                id: req.params.role_id,
            },
        });

        const response = {
            "status": true,
            "data": 'Role deleted successfully'
        };
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}


module.exports = {
    addRole,
    getRoles,
    updateRole,
    deleteRole
}