const mysql = require('mysql');
let con = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "cotulity"
});
class DB {
    static execQuery(query, callback) {
        con.query(query, callback);
    }
}
module.exports = DB;