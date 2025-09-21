import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addToCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCartItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const removeFromCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const clearCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addToWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleWishlistItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cart.d.ts.map