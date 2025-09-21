import { IWishlist, IOrder, ICollection } from '../types';
export declare const Wishlist: import("mongoose").Model<IWishlist, {}, {}, {}, import("mongoose").Document<unknown, {}, IWishlist, {}, {}> & IWishlist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const Order: import("mongoose").Model<IOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const Collection: import("mongoose").Model<ICollection, {}, {}, {}, import("mongoose").Document<unknown, {}, ICollection, {}, {}> & ICollection & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export { User } from './User';
export { Product } from './Product';
export { Cart } from './Cart';
//# sourceMappingURL=index.d.ts.map