import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const createRateLimit: (windowMs: number, max: number, message: string) => import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const corsOptions: {
    origin: (origin: any, callback: any) => any;
    credentials: boolean;
    optionsSuccessStatus: number;
};
export { protect, restrictTo, optionalAuth } from './auth';
//# sourceMappingURL=index.d.ts.map