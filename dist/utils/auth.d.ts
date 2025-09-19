import { IUser } from '@/types';
interface JWTPayload {
    id: string;
    email: string;
    role: string;
}
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const getCookieOptions: () => {
    expires: Date;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
};
export {};
//# sourceMappingURL=auth.d.ts.map