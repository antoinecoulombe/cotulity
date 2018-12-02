'use strict';

var phoneFormatter = require('phone-formatter'),
  bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
      get() {
        return this.getDataValue('number');
      },
      set(val) {
        let phone = phoneFormatter.normalize(val);
        let regionnalCode = phone.length - 10;
        let n = "+";
        for (let i = 0; i < regionnalCode; ++i)
          n += "N";
        n += "(NNN) NNN-NNNN";
        this.setDataValue('number', phoneFormatter.format(phone, n));
      }
    },
    birthdate: {
      type: DataTypes.DATE
    },
    admin: {
      type: DataTypes.BOOLEAN,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    }
  }, {
      timestamps: true,
      paranoid: true,
      underscored: false,
      freezeTableName: false,
      tableName: 'users'
    });
  User.associate = (models) => {
    User.hasMany(models.PaidBill, {
      foreignKey: 'paidByUserId',
      sourceKey: 'id'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      sourceKey: 'id'
    });
    User.hasMany(models.Semester, {
      foreignKey: 'userId',
      sourceKey: 'id'
    });
    User.belongsToMany(models.PaidBill, {
      as: 'BillsToPay',
      through: models.BillBorrowers,
      foreignKey: 'userId',
      otherKey: 'paidBillId'
    });
    User.belongsToMany(models.Task, {
      as: 'Tasks',
      through: models.TaskDates,
      foreignKey: 'userId',
      otherKey: 'taskId'
    });
    User.belongsToMany(models.Address, {
      as: 'Addresses',
      through: models.UserAddresses,
      foreignKey: 'userId',
      otherKey: 'addressId'
    });
    User.belongsToMany(models.App, {
      as: 'Apps',
      through: models.UserApps,
      foreignKey: 'userId',
      otherKey: 'appId'
    });
    User.belongsToMany(models.User, {
      as: 'Friends',
      through: models.UserFriends,
      foreignKey: 'userId',
      otherKey: 'friendId'
    }); // working?? self-referencing belongsToMany..
    User.belongsToMany(models.Setting, {
      as: 'Settings',
      through: models.UserSettings,
      foreignKey: 'userId',
      otherKey: 'settingId'
    });
  };

  User.validPassword = (password, passwd, done, user) => {
    bcrypt.compare(password, passwd, (err, isMatch) => {
      if (err) console.log(err);
      return done(null, isMatch ? user : false);
    });
  }

  User.beforeCreate((user, options) => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return reject(err);

        bcrypt.hash(user.password, salt, null, (err, hash) => {
          if (err) return reject(err);
          return resolve(hash);
        });
      });
    }).then(password => {
      user.password = password;
    }).catch(err => {
      console.log(err);
    });
  });

  return User;
};