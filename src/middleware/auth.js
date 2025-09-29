import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Authenticates requests using JWT in the Authorization header: "Bearer <token>"
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"]; // handle different casings
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Invalid authorization header" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach decoded payload (e.g., { id, email, role, iat, exp }) to req.user
        req.user = decoded;
        return next();
    } catch (error) {
        if (error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError") {
            return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Invalid or expired token" });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
};

// Authorize access based on user roles (e.g., 'admin', 'vendor', 'customer')
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Forbidden" });
        }
        return next();
    };
};

// Optional: authorize if acting on own resource OR has one of the roles
export const authorizeSelfOrRoles = (getOwnerIdFromReq, ...allowedRoles) => {
    return (req, res, next) => {
        try {
            const userId = req.user?.id;
            const ownerId = typeof getOwnerIdFromReq === 'function' ? getOwnerIdFromReq(req) : undefined;

            if (userId && ownerId && String(userId) === String(ownerId)) {
                return next();
            }
            if (req.user?.role && allowedRoles.includes(req.user.role)) {
                return next();
            }
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Forbidden" });
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
        }
    };
};
