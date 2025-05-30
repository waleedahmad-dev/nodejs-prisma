const db = require('../config/database');

module.exports = {
  async createUser(userData) {
    console.log('Creating user with data:', userData);
    return await db.user.create({
      data: {
        ...userData,
        role: {
          connect: { id: userData.role },
        },
      },
    });
  },

  async updateUser(userId, updateData) {
    return await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  },

  async findUserById(userId) {
    return await db.user.findUnique({
      where: { id: userId },
    });
  },

  async findUserByIdWithRole(userId) {
    return await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  },

  async findUserByEmail(email) {
    return await db.user.findUnique({
      where: { email },
      include: { role: true }, // Include role information if needed
    });
  },

  async findAllUsers({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const users = await db.user.findMany({
      skip,
      take: limit,
    });
    const total = await db.user.count();
    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async searchUsers(searchString = '', { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const query = searchString
      ? {
          OR: [
            { name: { contains: searchString, mode: 'insensitive' } },
            { email: { contains: searchString, mode: 'insensitive' } },
            // Add more fields here if needed
          ],
        }
      : {};
    const users = await db.user.findMany({
      where: query,
      skip,
      take: limit,
      select: {
        // Exclude password and salt
        password: false,
        salt: false,
        // ...other fields...
      },
    });
    const total = await db.user.count({ where: query });
    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async updateUserPassword(id, newPassword, salt) {
    return await db.user.update({
      where: { id },
      data: { password: newPassword, salt },
    });
  },

  async deleteUser(userId) {
    return await db.user.delete({
      where: { id: userId },
    });
  },
};
