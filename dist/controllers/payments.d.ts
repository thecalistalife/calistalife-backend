import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const createPaymentIntent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const handleStripeWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=payments.d.ts.map