import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, Permission, UserRole } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: UserRole;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'dev_medisure_jwt_secret_change_in_prod';
};

/**
 * Attaches `req.user` if a valid Bearer JWT is present, without failing if absent.
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Ignore invalid optional token
  }
  next();
};

/**
 * Verifies the Bearer JWT and attaches the active user document to `req.user`.
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const user = await User.findById(decoded.id);

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
  } catch {
    res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Restricts route access to users with one of the specified roles.
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

/**
 * Restricts route access to users who possess all specified permissions.
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const missing = permissions.filter((perm) => !req.user!.hasPermission(perm));
    if (missing.length > 0) {
      res.status(403).json({
        message: `Access denied. Missing permission(s): ${missing.join(', ')}.`,
      });
      return;
    }

    next();
  };
};

/**
 * Allows access if the authenticated user is targeting their own record
 * or possesses the fallback administrative permission.
 */
export const requireSelfOrPermission = (fallbackPermission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

