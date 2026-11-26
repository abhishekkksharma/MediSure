"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSelfOrPermission = exports.requirePermission = exports.authorizeRoles = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const getJwtSecret = () => {
    return process.env.JWT_SECRET || 'dev_medisure_jwt_secret_change_in_prod';
};
/**
 * Verifies the Bearer JWT and attaches the active user document to `req.user`.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authentication required. No token provided.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const user = await user_model_1.default.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'Invalid token. User no longer exists.' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ message: 'Account is deactivated. Contact an administrator.' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};
exports.authenticate = authenticate;
/**
 * Restricts route access to users with one of the specified roles.
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}.`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
/**
 * Restricts route access to users who possess all specified permissions.
 */
const requirePermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const missing = permissions.filter((perm) => !req.user.hasPermission(perm));
        if (missing.length > 0) {
            res.status(403).json({
                message: `Access denied. Missing permission(s): ${missing.join(', ')}.`,
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Allows access if the authenticated user is targeting their own record
 * or possesses the fallback administrative permission.
 */
const requireSelfOrPermission = (fallbackPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const isSelf = req.user._id.toString() === req.params.id;
        if (isSelf || req.user.hasPermission(fallbackPermission)) {
            next();
            return;
        }
        res.status(403).json({
            message: `Access denied. Requires ownership or '${fallbackPermission}' permission.`,
        });
    };
};
exports.requireSelfOrPermission = requireSelfOrPermission;
