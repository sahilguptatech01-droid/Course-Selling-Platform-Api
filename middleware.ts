import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    id?: string;
    role?: string;
}

interface TokenPayload {
    id: string;
    role: string;
}

export function authMiddleware(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): void | Response {
    try {
        const authHeader = (req.headers.authorization || req.headers.token) as string | undefined;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "UNAUTHORIZED"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("SECRET_KEY is missing");
        }

        const decoded = jwt.verify(token, secretKey) as TokenPayload;

        req.id = decoded.id;
        req.role = decoded.role;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED"
        });
    }
}
