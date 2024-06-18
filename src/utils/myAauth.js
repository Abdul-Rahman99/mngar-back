
const { sequelize } = require('../models'); 
const { Roles, User_Role, Permissions, Role_Permissions } = require('../models');
const isAdmin = async (userId) => {
    try {
      // Assuming you have a mapping or configuration for the admin role name
      const adminRoleName = 'Admin';
  
      // Check if the user is a member of the admin role
      const isAdminUser = await isMember(adminRoleName, userId);
  
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

const isMember = async (roleName, userId) => {
    try {
      const roleId = await getRoleIdd(roleName);
  
      // Assuming you have a model named UserRole for the user_roles table
      const userRole = await User_Role.findOne({
        where: { user_id: userId, role_id: roleId },
      });
  
      return !!userRole; // Returns true if user is a member, false otherwise
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
};

const getRoleIdd = async (roleName) => {
    try {
      const role = await Roles.findOne({
        where: { name: roleName },
      });
  
      return role ? role.id : null; 
    } catch (error) {
      console.error('Error getting role ID:', error);
      throw error; 
    }
};

const control = async (permName, userId) => {
  try {
    const permId = await getPermId(permName);
    if (!(await isAllowed(permId, userId) && !(await isRoleAllowed(permId, userId)))) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    // Handle the error response accordingly
    throw error;
  }
};

const getPermId = async (permName) => {
  try {
    if (typeof permName === 'number') {
      return permName;
    }

    const permission = await Permissions.findOne({
      attributes: ['id'],
      where: { name: permName },
    });

    return permission ? permission.id : false;
  } catch (error) {
    console.error('Error getting permission ID:', error);
    throw error;
  }
};

const getRoleNames = async (userId) => {
  try {
    const userRoles = await getUserRoles(userId);
    return userRoles.map((role) => role.name);
  } catch (error) {
    console.error('Error getting user roles:', error);
    throw error;
  }
};

const getUserRoles = async (userId) => {
  try {
    const userRoles = await User_Role.findAll({
      attributes: ['id', 'role_id'], 
      include: [
        {
          model: Roles,
          attributes: ['id', 'name'],
        },
      ],
      where: { user_id: userId },
    });
   
    return userRoles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    throw error;
  }
};

const getRoleId = async (roleName) => {
  try {
    if (typeof roleName === 'number') {
      return roleName;
    }

    const role = await Roles.findOne({
      attributes: ['id'],
      where: { name: roleName },
    });

    return role ? role.id : false;
  } catch (error) {
    console.error('Error getting role ID:', error);
    throw error;
  }
};

const isAllowed2 = async (permName, userId) => {
  try {
    if (await isAdmin(userId)) {
      return true;
    }
   
    const permId = await getPermId(permName);

   

    if (userId === undefined) {
     
      return isRoleAllowed(permId);
    } else {
      const userRoles = await getUserRoles(userId);
    
      for (const role of userRoles) {
        if (await isRoleAllowed(permId, role.role_id)) {
          return true;
        }
      }

      return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  }
};

const isRoleAllowed = async (permName, roleId = false, userId = false) => {
  try {
    const permId = await getPermId(permName);
    if (roleId !== false) {
      const rolePermission = await Role_Permissions.findOne({
        where: { perm_id: permId, role_id: roleId },
      });
      return !!rolePermission;
    } else if (userId !== false) {
      const roleNames = await getRoleNames(userId);

      return roleNames.some(async (roleName) => await isRoleAllowed(permId, roleName));
    
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking role permission:', error);
    throw error;
  }
};

///////////////////////////

const isAllowed = async (permName, userId) => {
  try {
    if (await isAdmin(userId)) {
      return true;
    } 
    const permId = await getPermId(permName);

    // Check if the permission is assigned to a role for the given user
    const isPermissionAssigned = await checkPermissionAssignment(permId, userId);

    return isPermissionAssigned;
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  }
};


const checkPermissionAssignment = async (permId, userId) => {
  try {
     
    const query = `
      SELECT COUNT(*) AS count
      FROM Permissions AS p
      JOIN Role_Permissions AS rp ON p.id = rp.perm_id
      JOIN Roles AS r ON rp.role_id = r.id
      JOIN User_Roles AS ur ON r.id = ur.role_id
      WHERE p.id = :permId AND ur.user_id = :userId
    `;

    const [result] = await sequelize.query(query, {
      replacements: { permId, userId },
      type: sequelize.QueryTypes.SELECT,
    });

    return result.count > 0; // Return true if a record is found, false otherwise
  } catch (error) {
    console.error('Error checking permission assignment:', error);
    throw error;
  }
};
  
module.exports = { isAllowed, isAdmin };
