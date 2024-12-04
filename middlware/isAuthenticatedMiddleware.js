const passport = require("../config/passport");
const isAuthenticated = passport.authenticate("bearer", {session: false})
module.exports = isAuthenticated;