const Users = require('../users');
const User = require('../models/user');
let users;
class UsersController {
    constructor(db) {
        if (db) {
            users = new Users(db);
        }
    }

    login(email, password, callback) {
        async.waterfall([
            cb => {
                users.exists({
                    email,
                    password,
                    firstname,
                    lastname,
                    phone
                }, false, cb);
            }, (result, cb) => {
                if (!result)
                    cb("This user doesn't exists!");
                users.getUser({
                    email,
                    password
                }, cb);
            }
        ], (err, result) => {
            if (err)
                callback(err);
            let user = result[0];
            callback(err, new Users(user.id, user.firstname, user.lastname, user.email, user.phone, user.admin, user.emailVerified, user.createAt, user.updatedAt, user.deleteAt));
        });
    }

    signup(email, password, firstname, lastname, phone, callback) {
        async.waterfall([
            cb => {
                users.exists({
                    email,
                    password,
                    firstname,
                    lastname,
                    phone
                }, false, cb);
            }, (result, cb) => {
                if (result)
                    cb("This user already exists!");
                users.exists({
                    email,
                    password,
                    firstname,
                    lastname,
                    phone
                }, true, cb);
            }, (result, cb) => {
                if (result)
                    cb("This user has been deleted!");
                users.create({
                    email,
                    password,
                    firstname,
                    lastname,
                    phone
                }, cb);
            }
        ], (err, result) => {
            if (err)
                callback(err);
            let user = result[0];
            callback(err, new Users(user.id, user.firstname, user.lastname, user.email, user.phone, user.admin, user.emailVerified, user.createAt, user.updatedAt, user.deleteAt));
        });
    }
}
module.exports = UsersController;