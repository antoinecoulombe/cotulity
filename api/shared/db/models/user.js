'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Home, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedHomes',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Task, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedTasks',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Notification, {
        foreignKey: 'toId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Expense, {
        foreignKey: 'paidByUserId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Transfer, {
        foreignKey: 'fromId',
        sourceId: 'id',
        as: 'TransferSent',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Transfer, {
        foreignKey: 'toId',
        sourceId: 'id',
        as: 'TransferReceived',
        onDelete: 'cascade',
        hooks: true,
      });
      User.hasMany(models.Grocery, {
        foreignKey: 'ownerId',
        sourceId: 'id',
        as: 'OwnedGroceries',
        onDelete: 'cascade',
        hooks: true,
      });
      User.belongsTo(models.Image);
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
      User.belongsToMany(models.TaskOccurence, {
        through: models.UserTask,
        as: 'TaskOccurences',
        foreignKey: 'userId',
        otherKey: 'taskOccurenceId',
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.email.missing',
        },
        unique: {
          args: true,
          msg: 'form.error.email.exists',
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'form.error.email.valid',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.password.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.password.missing',
          },
          len: {
            args: [60, 60],
            msg: 'request.error',
          },
        },
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.firstname.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.firstname.missing',
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.lastname.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.lastname.missing',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'form.error.phone.exists',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.phone.missing',
          },
        },
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
