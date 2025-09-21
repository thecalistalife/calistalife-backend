import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requestEmailVerification: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addAddress: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAddress: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAddress: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map