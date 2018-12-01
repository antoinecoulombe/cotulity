var db = require('../models');

exports.login = function(req, res) {
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('login.ejs')
}

exports.register = function(req, res) {
    db.User.find({where: {username: req.username}}).success(function(user) {
        if (!user) {
            db.User.create({
                username: req.body.username,
                password: req.body.password,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone
            }).error(function(err) {
                console.log(err);
            });
        } else {
            res.redirect('/login');
        }
    });
}