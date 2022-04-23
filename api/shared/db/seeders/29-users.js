'use strict';

const bcrypt = require('bcryptjs');

// Hash password
const salt = bcrypt.genSaltSync(10);
const password = bcrypt.hashSync('123123', salt);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'Vincent.Ducharme2@USherbrooke.ca',
          password: password,
          firstname: 'Vincent',
          lastname: 'Ducharme',
          phone: '555-555-5554',
          emailVerifiedAt: Sequelize.literal('NOW()'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          email: 'Frederic.Bergeron2@USherbrooke.ca',
          password: password,
          firstname: 'Frederic',
          lastname: 'Bergeron',
          phone: '555-555-5555',
          emailVerifiedAt: Sequelize.literal('NOW()'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
