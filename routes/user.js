var db = require('../models'),
    passport = require('passport');

exports.login = (req, res) => {
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('login.ejs')
}

exports.register = (req, res) => {
    db.User.findOne({where: {username: req.username}}).then(user => {
        if (!user) {
            db.User.create({
                username: req.body.username,
                password: req.body.password,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone
            }).then(() => {
                passport.authenticate('local')(req, res, () => { res.redirect('/'); });
            }).catch(err => {
                console.log(err);
            });
        } else {
            res.redirect('/login');
        }
    });
}