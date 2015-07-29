var XlreSecurity = function() {

};

XlreSecurity.prototype.requireRole = function(role) {
    return function(req, res, next) {
        if(req.session.user && req.session.user.role === role)
            next();
        else
            res.send(403);
    }
};

module.exports = new XlreSecurity();