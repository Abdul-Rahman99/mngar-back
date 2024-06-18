// sessionMiddleware.js
const { isAllowed , isAdmin} = require('../utils/myAauth');

const sessionMiddleware = async (req, res, next, permissionName) => {
    try {
        // Check if the route is public (adjust as needed)
        // const isPublicRoute =
        //     req.originalUrl.includes('/login') ||
        //     req.originalUrl.includes('/register');

        // if (isPublicRoute) {
        //     next();
        // } else {
        // return req ;

        if (req.session && req.session.user) {
            // User is authenticated, continue to the next middleware or route handler
            // next();
            // Check if the user is allowed to access the route
            const allowed = await isAllowed(permissionName, req.session.user.id);
 
            if (allowed ) {
                
                // User is authenticated and has the necessary permission, continue to the next middleware or route handler
                next();
            } else {
                // User does not have the necessary permission, send an unauthorized response
                res.status(401).json({ success: false, message: 'Unauthorized' });
            }
        } else {
            // User is not authenticated, send an unauthorized response
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // }
    } catch (error) {
        console.error('Error in sessionMiddleware:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = sessionMiddleware;
