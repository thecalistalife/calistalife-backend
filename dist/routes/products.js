"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = require("@/controllers/products");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
router.get('/', middleware_1.optionalAuth, products_1.getProducts);
router.get('/featured', products_1.getFeaturedProducts);
router.get('/new-arrivals', products_1.getNewArrivals);
router.get('/best-sellers', products_1.getBestSellers);
router.get('/collections', products_1.getCollections);
router.get('/filters', products_1.getFilterOptions);
router.get('/search/suggestions', products_1.getSearchSuggestions);
router.get('/category/:category', products_1.getProductsByCategory);
router.get('/:id', products_1.getProduct);
exports.default = router;
//# sourceMappingURL=products.js.map