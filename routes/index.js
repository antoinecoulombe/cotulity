exports.index = function(req, res) {
    if (req.isAuthenticated())
        res.render("apps.ejs");
    else
        res.render("login.ejs");
}