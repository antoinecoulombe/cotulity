let queryExists = `select * from users where email = ? and password = ?`;
let queryCreate = `insert into users (firstname, lastname, email, phone, password) values (?,?,?,?,?)`;
let queryDelete = `update users set deleted_at = CURRENT_TIMESTAMP where email = ? and password = ? and deleted_at = NULL`;
let queryReactivate = `update users set deleted_at = NULL where email = ? and password = ?`;
class Users {
    constructor(db) {
        if (db)
            this.db = db;
        console.log("Database is not defined");
    }

    exists(params, withTrash, callback) {
        if (withTrash)
            queryExists += ' and deleted_at = NULL';
        this.db.execQuery(queryExists, [params.email, params.password], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result.length != 0);
        });
    }

    getUser(params, withTrash, callback) {
        if (withTrash)
            queryExists += ' and deleted_at = NULL';
        this.db.execQuery(queryExists, [params.email, params.password], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result[0]);
        });
    }

    delete(params, callback) {
        this.db.execQuery(queryDelete, [params.email, prams.password], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result[0]);
        });
    }

    create(params, callback) {
        this.db.execQuery(queryCreate, [params.firstname, params.lastname, params.email, params.phone, params.password], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result.affectedRows == 1);
        });
    }

    reactivate(params, callback) {
        this.db.execQuery(queryReactivate, [params.email, params.password], (err, result) => {
            if (err)
                callback(err);
            else
                callback(err, result[0]);
        });
    }
}
module.exports = Users;