'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Home, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedHomes',
      });
      User.hasMany(models.Task, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedTasks',
      });
      User.hasMany(models.Notification, {
        foreignKey: 'toId',
        sourceId: 'id',
      });
      User.hasMany(models.Expense, {
        foreignKey: 'paidByUserId',
        sourceId: 'id',
      });
      User.hasMany(models.Transfer, {
        foreignKey: 'fromId',
        sourceId: 'id',
        as: 'TransferSent',
      });
      User.hasMany(models.Transfer, {
        foreignKey: 'toId',
        sourceId: 'id',
        as: 'TransferReceived',
      });
      User.hasMany(models.Grocery, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedGroceries',
      });
      User.belongsToMany(models.Expense, {
        through: models.ExpenseSplit,
        as: 'InvolvedExpense',
        foreignKey: 'userId',
        otherKey: 'expenseId',
      });
      User.belongsToMany(models.Home, {
        through: models.UserHome,
        as: 'Homes',
        foreignKey: 'userId',
        otherKey: 'homeId',
      });
      User.belongsToMany(models.Task, {
        through: models.UserTask,
        as: 'Tasks',
        foreignKey: 'userId',
        otherKey: 'taskId',
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter your email address.',
        },
        unique: {
          args: true,
          msg: 'This email address already exists.',
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'Please enter a valid email address.',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter a password.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter a password.',
          },
          len: {
            args: [60, 60],
            msg: 'The password must be between 6 and 30 caracters.',
          },
        },
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter your firstname.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter your firstname.',
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter your lastname.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter your lastname.',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'This phone number is already linked to another account.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter your phone number.',
          },
          // isValid(phone) {
          //   if (phone.startsWith('INVALID-'))
          //     throw new Error('Invalid phone number.');
          // },
        },
        // set(value) {
        //   this.setDataValue('phone', (value) => {
        //     var cleaned = ('' + value).replace(/\D/g, '');
        //     var match = cleaned.match(/^(\d{1,5}|)?(\d{3})(\d{3})(\d{4})$/);

        //     if (match) {
        //       let regionalCode = match[1] ? '+' + match[1] + ' ' : '';
        //       return [
        //         regionalCode,
        //         '(',
        //         match[2],
        //         ') ',
        //         match[3],
        //         '-',
        //         match[4],
        //       ].join('');
        //     }

        //     return 'INVALID-' + value;
        //   });
        // },
      },
      image: {
        type: DataTypes.STRING,
      },
      admin: {
        type: DataTypes.BOOLEAN,
      },
      emailVerifiedAt: DataTypes.DATE,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Users',
      sequelize,
    }
  );
  return User;
};
