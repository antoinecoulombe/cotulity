exports.index = (req, res) => {
  if (req.isAuthenticated()) res.render("../../frontend/src/index.tsx");
  else res.render("../../frontend/src/login.tsx");
};
