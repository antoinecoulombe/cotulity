const Users = require('../users');
const async = require('async');
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
                    password
                }, false, cb);
            }, (exist, cb) => {
                if (!exist)
                    cb("This user doesn't exists!");
                users.getUser({
                    email,
                    password
                }, cb);
            }
        ], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result[0]);
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
            else
                callback(err, result[0]);
        });
    }
}
module.exports = UsersController;