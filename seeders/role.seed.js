const db = require('../src/config/database');
const { USER_ROLES, PERMISSIONS_ARRAY } = require('../src/config/contants');

module.exports = async () => {
  try {
    for (const roleName of Object.values(USER_ROLES)) {
      const exists = await db.role.findFirst({
        where: {
          name: roleName,
        },
      });
      if (!exists) {
        console.log(`Role "${roleName}" seeded`);
        const permissions = PERMISSIONS_ARRAY;

        const role = await db.role.create({
          data: {
            name: roleName,
            permissions,
          },
        });
        console.log(role);
        console.log(`Permissions assigned to role "${roleName}"`);
      } else {
        console.log(`Role "${roleName}" already exists`);
      }
    }
    console.log('Role seeding completed');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};
