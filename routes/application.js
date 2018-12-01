exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
        next();
    else 
        res.redirect(401, '/login');
        // next(new Error(401));
}

exports.destroySession = function(req, res, next) {
    req.logOut();
    req.session.destroy();
    res.redirect("/");
}