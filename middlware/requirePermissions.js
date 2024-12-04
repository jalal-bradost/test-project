const isAuthenticated = require("./isAuthenticatedMiddleware");

function requirePermissions(allowedPermissions, fullAccess = true) {
    return [isAuthenticated, function (req, res, next) {
        if(!req.user) return res.status(401).json({message: "پێویستە بچیتە ژوورەوە"});
        const userPermissions = req.user.Role?.permissions || [];
        if (fullAccess && userPermissions.includes(0)) return next();
        for (const permission of userPermissions) {
            if (allowedPermissions.includes(permission)) return next();
        }
        return res.status(403).json({message: "مۆڵەتت نییە بۆ ئەم کردارە"});
    }]
}

module.exports = requirePermissions;