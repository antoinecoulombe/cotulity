exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())
        next();
    else 
        res.redirect(401, '/login');
        // next(new Error(401));
}

exports.destroySession = (req, res, next) => {
    req.logOut();
    req.session.destroy();
    res.redirect("/");
}