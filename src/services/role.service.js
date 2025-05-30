const { USER_ROLES, PERMISSIONS_ARRAY } = require('../config/contants');
const db = require('../config/database');
module.exports = {
  async createRole({ name, permissions = [] }) {
    try {
      const existingRole = await db.role.findUnique({ where: { name } });
      if (existingRole) {
        console.log(`Role "${name}" already exists`);
        throw new Error('Role already exists');
      }
      // check all permissions are valid
      const invalidPermissions = permissions.filter(
        (perm) => !PERMISSIONS_ARRAY.includes(perm)
      );
      if (invalidPermissions.length > 0) {
        console.error(
          `Invalid permissions for role "${name}": ${invalidPermissions.join(', ')}`
        );
        throw new Error('Invalid permissions provided');
      }
      const role = await db.role.create({
        data: {
          name,
          permissions,
        },
      });
      console.log('Role creation completed');
      return role;
    } catch (error) {
      console.error('Error creating roles:', error);
      throw error;
    }
  },
  async listRoles(search, limit = 10, page = 1) {
    try {
      const where = {
        name: { not: USER_ROLES.ADMIN },
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      };
      const roles = await db.role.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
      });
      const totalCount = await db.role.count({ where });
      return {
        roles,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error listing roles:', error);
      throw error;
    }
  },
  async getRoleById(roleId) {
    try {
      const role = await db.role.findUnique({ where: { id: roleId } });
      if (!role) {
        console.error(`Role with ID ${roleId} not found`);
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      console.error('Error fetching role by ID:', error);
      throw error;
    }
  },
  async updateRole(roleId, updates) {
    try {
      const existRole = await this.getRoleById(roleId);
      if (!existRole) {
        console.error(`Role with ID ${roleId} not found`);
        throw new Error('Role not found');
      }
      // Validate permissions if provided
      if (updates.permissions) {
        const invalidPermissions = updates.permissions.filter(
          (perm) => !PERMISSIONS_ARRAY.includes(perm)
        );
        if (invalidPermissions.length > 0) {
          console.error(
            `Invalid permissions for role update: ${invalidPermissions.join(', ')}`
          );
          throw new Error('Invalid permissions provided');
        }
      }
      // Ensure role name is not empty
      if (updates.role_name && updates.role_name.trim() === '') {
        console.error('Role name cannot be empty');
        throw new Error('Role name cannot be empty');
      }
      const role = await db.role.update({
        where: { id: roleId },
        data: updates,
      });

      return role;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },
  async deleteRole(roleId) {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }
      if (role.name === USER_ROLES.ADMIN) {
        throw new Error('Unable to delete admin role');
      }
      // Actually delete the role
      await db.role.delete({ where: { id: roleId } });
      return role;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },
};
