const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); 

const protect = asyncHandler(async (req, res, next) => {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            
            req.user = await User.findById(decoded.id).select('-password');

            next(); 
        } catch (error) {
            console.error(error);
            res.status(401); 
            throw new Error('Not authorized, token failed'); 
        }
    }

    // If no token is provided in the request
    if (!token) {
        res.status(401); 
        throw new Error('Not authorized, no token'); 
    }
});

// Middleware to authorize only admin users
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); 
        res.status(403);
        throw new Error('Not authorized as an admin'); 
    }
};

module.exports = { protect, authorizeAdmin };