const db = require('./models/database');
class Users {
    static exists(user) {
        let query = `Select * from users where email = '${user.email}' and password = '${user.password}'`;
        db.execQuery(query, (err, result) => {
            if(err)
                return err;
            return result;
        });
    }


}
module.exports = Users;