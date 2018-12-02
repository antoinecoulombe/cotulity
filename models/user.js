'use strict';

var bcrypt = require('bcrypt-nodejs');

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
        notEmpty: true,
        isValid(phone) {
          if (phone.length < 10)
            throw new Error("Invalid phone number.");
        }
      },
      set(value) {
        function format(phone) {
          var cleaned = ('' + phone).replace(/\D/g, '');
          var match = cleaned.match(/^(\d{1,5}|)?(\d{3})(\d{3})(\d{4})$/);
          if (match) {
            let regionalCode = match[1] ? ('+' + match[1] + ' ') : '';
            return [regionalCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
          }
          return phone;
        }

        this.setDataValue('phone', format(value));
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