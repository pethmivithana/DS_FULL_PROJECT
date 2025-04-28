const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                status: false,
                message: "Access Denied: No token provided" 
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and token is valid
        const user = await User.findOne({
            _id: decoded._id,
            isApproved: true, // Only allow approved users
            'tokens.token': token // If you're storing tokens in user document
        }).select('-password'); // Exclude password field

        if (!user) {
            return res.status(401).json({ 
                status: false,
                message: "User not found or token invalid" 
            });
        }

        // Attach user and token to the request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        // Handle different JWT errors specifically
        let message = "Invalid Token";
        if (error.name === 'TokenExpiredError') {
            message = "Token expired";
        } else if (error.name === 'JsonWebTokenError') {
            message = "Malformed token";
        }

        res.status(401).json({ 
            status: false,
            message,
            error: error.message 
        });
    }
};

// Role-based middlewares (unchanged but improved with status field)
exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ 
            status: false,
            message: "Admin access required" 
        });
    }
    next();
};

exports.restaurantManagerMiddleware = (req, res, next) => {
    if (req.user.role !== "restaurantManager") {
        return res.status(403).json({ 
            status: false,
            message: "Restaurant Manager access required" 
        });
    }
    next();
};

exports.deliveryPersonMiddleware = (req, res, next) => {
    if (req.user.role !== "deliveryPerson") {
        return res.status(403).json({ 
            status: false,
            message: "Delivery Person access required" 
        });
    }
    next();
};

exports.customerMiddleware = (req, res, next) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({ 
            status: false,
            message: "Customer access required" 
        });
    }
    next();
};

// Optional: Combined role middleware for multiple roles
exports.roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: false,
                message: `Access restricted to: ${roles.join(', ')}`
            });
        }
        next();
    };
};