"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const cartItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    }
}, {
    _id: false
});
const cartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    }
}, {
    timestamps: true
});
cartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});
cartSchema.methods.addItem = function (productId, size, color, quantity, price) {
    const existingItemIndex = this.items.findIndex((item) => item.product.toString() === productId &&
        item.size === size &&
        item.color === color);
    if (existingItemIndex >= 0) {
        this.items[existingItemIndex].quantity += quantity;
    }
    else {
        this.items.push({
            product: productId,
            size,
            color,
            quantity,
            price
        });
    }
    return this.save();
};
cartSchema.methods.removeItem = function (productId, size, color) {
    this.items = this.items.filter((item) => !(item.product.toString() === productId &&
        item.size === size &&
        item.color === color));
    return this.save();
};
cartSchema.methods.updateItemQuantity = function (productId, size, color, quantity) {
    const item = this.items.find((item) => item.product.toString() === productId &&
        item.size === size &&
        item.color === color);
    if (item) {
        item.quantity = quantity;
    }
    return this.save();
};
cartSchema.methods.clearCart = function () {
    this.items = [];
    return this.save();
};
cartSchema.methods.getTotalItems = function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
};
exports.Cart = (0, mongoose_1.model)('Cart', cartSchema);
//# sourceMappingURL=Cart.js.map