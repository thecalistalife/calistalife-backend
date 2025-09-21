import { IUser } from '../types';
interface JWTPayload {
    id: string;
    email: string;
    role: string;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateRefreshToken: () => {
    token: string;
    hash: string;
    expires: Date;
};
export declare const getAccessCookieOptions: () => {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    expires: Date;
};
export declare const getRefreshCookieOptions: () => {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    expires: Date;
};
export declare const getCookieOptions: () => {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    expires: Date;
};
export {};
//# sourceMappingURL=auth.d.ts.map