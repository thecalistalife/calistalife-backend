"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlistItem = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const models_1 = require("../models");
const getCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let cart = await models_1.Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            cart = await models_1.Cart.create({ user: userId, items: [] });
        }
        const response = {
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, size, color, quantity = 1 } = req.body;
        const product = await models_1.Product.findById(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        if (!product.inStock) {
            res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
            return;
        }
        if (!product.sizes.includes(size)) {
            res.status(400).json({
                success: false,
                message: 'Invalid size for this product'
            });
            return;
        }
        if (!product.colors.includes(color)) {
            res.status(400).json({
                success: false,
                message: 'Invalid color for this product'
            });
            return;
        }
        let cart = await models_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = await models_1.Cart.create({ user: userId, items: [] });
        }
        await cart.addItem(productId, size, color, quantity, product.price);
        cart = await models_1.Cart.findById(cart._id).populate('items.product');
        const response = {
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, size, color, quantity } = req.body;
        if (quantity < 1) {
            res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
            return;
        }
        const cart = await models_1.Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        await cart.updateItemQuantity(productId, size, color, quantity);
        const updatedCart = await models_1.Cart.findById(cart._id).populate('items.product');
        const response = {
            success: true,
            message: 'Cart item updated successfully',
            data: updatedCart
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId, size, color } = req.body;
        const cart = await models_1.Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        await cart.removeItem(productId, size, color);
        const updatedCart = await models_1.Cart.findById(cart._id).populate('items.product');
        const response = {
            success: true,
            message: 'Item removed from cart successfully',
            data: updatedCart
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const cart = await models_1.Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
            return;
        }
        await cart.clearCart();
        const response = {
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let wishlist = await models_1.Wishlist.findOne({ user: userId }).populate('items.product');
        if (!wishlist) {
            wishlist = await models_1.Wishlist.create({ user: userId, items: [] });
        }
        const response = {
            success: true,
            message: 'Wishlist retrieved successfully',
            data: wishlist
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        const product = await models_1.Product.findById(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        let wishlist = await models_1.Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await models_1.Wishlist.create({ user: userId, items: [] });
        }
        await wishlist.addItem(productId);
        wishlist = await models_1.Wishlist.findById(wishlist._id).populate('items.product');
        const response = {
            success: true,
            message: 'Item added to wishlist successfully',
            data: wishlist
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        const wishlist = await models_1.Wishlist.findOne({ user: userId });
        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
            return;
        }
        await wishlist.removeItem(productId);
        const updatedWishlist = await models_1.Wishlist.findById(wishlist._id).populate('items.product');
        const response = {
            success: true,
            message: 'Item removed from wishlist successfully',
            data: updatedWishlist
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
const toggleWishlistItem = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        const product = await models_1.Product.findById(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        let wishlist = await models_1.Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await models_1.Wishlist.create({ user: userId, items: [] });
        }
        const existingItem = wishlist.items.find(item => item.product.toString() === productId);
        let message;
        if (existingItem) {
            await wishlist.removeItem(productId);
            message = 'Item removed from wishlist successfully';
        }
        else {
            await wishlist.addItem(productId);
            message = 'Item added to wishlist successfully';
        }
        wishlist = await models_1.Wishlist.findById(wishlist._id).populate('items.product');
        const response = {
            success: true,
            message,
            data: wishlist
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.toggleWishlistItem = toggleWishlistItem;
//# sourceMappingURL=cart.js.map