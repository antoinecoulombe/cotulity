class User {
    constructor(id, firstname, lastname, email, phone, admin, emailVerified, createAt, updatedAt, deleteAt) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phone = phone;
        this.admin = admin;
        this.emailVerified = emailVerified;
        this.createAt = createAt;
        this.updatedAt = updatedAt;
        this.deleteAt = deleteAt;
    }
}
module.exports = User;