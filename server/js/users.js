class Users {
    constructor(db) {
        if (db)
            this.db = db;
        console.log("Database is not defined");
    }

    exists(params, withTrash, callback) {
        let query;
        if (withTrash)
            query = `select * from users where email = '${params.email}' and password = '${params.password}'`;
        else
            query = `select * from users where email = '${params.email}' and password = '${params.password}' and delete_at = NULL`;
        this.db.execQuery(query, (err, result) => {
            if (err)
                callback(err);
            callback(err, result.length != 0);
        });
    }

    getUser(params, withTrash, callback) {
        let query;
        if (withTrash)
            query = `select * from user where email ='${params.mail} and password = '${params.password}'`;
        else
            query = `select * from user where email ='${params.email} and password = '${params.password}' and delete_at = NULL`;
        this.db.execQuery(query, (err, result) => {
            if (err)
                callback(err);
            callback(err, result[0]);
        });
    }

    delete(params, callback) {
        let query = `update users set delete_at = CURRENT_TIMESTAMP where email = '${params.email} and password = '${params.password}' and delete_At = NULL`;
        this.db.execQuery(query, (err, result) => {
            if (err)
                callback(err);
            callback(err, result[0]);
        })
    }

    create(params, callback) {
        let query = `insert into user('firstname', 'lastname', 'email', 'phone', 'password', 'create_at') 
        values(${params.firstname}, ${params.lastname}, ${params.email}, ${params.phone}, ${params.password}, CURRENT_TIMESTAMP)`;
        this.db.execQuery(query, (err, result) => {
            if (err)
                callback(err);
            callback(err, result[0]);
        });
    }

    reactivate(params, callback) {
        let query = `update users set delete_at = NULL where email = '${params.email}' and password = '${params.password}'`;
        this.db.execQuery(query, (err, result) => {
            if (err)
                callback(err);
            callback(err, result[0]);
        });
    }
}
module.exports = Users;