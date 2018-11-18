const mysql = require('mysql2');
let con = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "cotulity"
});
class DB {
    static execQuery(query, params, callback) {
        con.execute(query, params, callback);
    }
}
module.exports = DB;