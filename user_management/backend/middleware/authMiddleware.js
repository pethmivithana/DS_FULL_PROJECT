const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

exports.restaurantManagerMiddleware = (req, res, next) => {
    if (req.user.role !== "restaurantManager") {
        return res.status(403).json({ message: "Restaurant Manager access required" });
    }
    next();
};

exports.deliveryPersonMiddleware = (req, res, next) => {
    if (req.user.role !== "deliveryPerson") {
        return res.status(403).json({ message: "Delivery Person access required" });
    }
    next();
};

exports.customerMiddleware = (req, res, next) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({ message: "Customer access required" });
    }
    next();
};
