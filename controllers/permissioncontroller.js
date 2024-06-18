const models = require("../models");
const { isAllowed, isAdmin } = require("../utils/myAauth");
const addPermission = async (req, res) => {
  try {
    const { id, isNew, name, definition } = req.body;

    if (!name || !definition) {
      return res.status(400).send("Both name and definition are required");
    }

    let Permission;

    if (isNew) {
      const existingPermission = await models.Permissions.findOne({
        where: { name },
      });

      if (existingPermission) {
        return res.status(409).send("Permission Already Exists");
      }

      Permission = await models.Permissions.create({
        name,
        definition,
      });
    } else {
      const updatedPermission = await models.Permissions.update(
        { name, definition },
        { where: { id } }
      );

      if (updatedPermission[0] === 0) {
        return res.status(404).send("Permission not found");
      }

      Permission = await models.Permissions.findByPk(id);
    }

    const response = {
      status: true,
      data: Permission,
    };

    res.status(200).send(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getPermissions = async (req, res) => {
  try {
    const Permissions = await models.Permissions.findAll();

    const response = {
      status: true,
      data: Permissions,
    };

    if (Permissions) {
      res.status(200).json(response);
    } else {
      res.status(200).json({ status: false, data: "No Permission found" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, data: "No Permission found" });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id, status } = req.body;

    let Permissions;

    Permissions = await models.Permissions.update(
      {
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    );

    const response = {
      status: true,
      data: Permissions,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const deletePermission = async (req, res) => {
  try {
    await models.Permissions.destroy({
      where: {
        id: req.params.permission_id,
      },
    });

    const response = {
      status: true,
      data: "Permission deleted successfully",
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};
const checkPermission = async (req, res) => {
  try {
    const { permissionName } = req.query;

    const userId = req.session.user.id; // Get user ID from the session

    // Perform your permission check logic
    const allowed = await isAllowed(permissionName, userId);

    res.json({ allowed });
  } catch (error) {
    console.error("Error checking permission:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

module.exports = {
  addPermission,
  getPermissions,
  updatePermission,
  deletePermission,
  checkPermission,
};
