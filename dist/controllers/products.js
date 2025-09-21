"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchSuggestions = exports.getFilterOptions = exports.getCollections = exports.getProductsByCategory = exports.getBestSellers = exports.getNewArrivals = exports.getFeaturedProducts = exports.getProduct = exports.getProducts = void 0;
const models_1 = require("../models");
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, search, category, collection, brand, minPrice, maxPrice, sizes, colors, inStock, sortBy = 'featured' } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (collection) {
            filter.collection = collection;
        }
        if (brand) {
            filter.brand = brand;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        if (sizes) {
            const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
            filter.sizes = { $in: sizeArray };
        }
        if (colors) {
            const colorArray = Array.isArray(colors) ? colors : [colors];
            filter.colors = { $in: colorArray };
        }
        if (inStock === 'true' || inStock === true) {
            filter.inStock = true;
        }
        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'price-low':
                sort = { price: 1 };
                break;
            case 'price-high':
                sort = { price: -1 };
                break;
            case 'name':
                sort = { name: 1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'featured':
            default:
                sort = { isFeatured: -1, isBestSeller: -1, isNew: -1, rating: -1 };
                break;
        }
        const pageNum = parseInt(page.toString());
        const limitNum = parseInt(limit.toString());
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            models_1.Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models_1.Product.countDocuments(filter)
        ]);
        const response = {
            success: true,
            message: 'Products retrieved successfully',
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let product = await models_1.Product.findById(id);
        if (!product) {
            product = await models_1.Product.findOne({ slug: id });
        }
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        const response = {
            success: true,
            message: 'Product retrieved successfully',
            data: product
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const getFeaturedProducts = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query;
        const products = await models_1.Product.find({ isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit.toString()))
            .lean();
        const response = {
            success: true,
            message: 'Featured products retrieved successfully',
            data: products
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const getNewArrivals = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query;
        const products = await models_1.Product.find({ isNew: true })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit.toString()))
            .lean();
        const response = {
            success: true,
            message: 'New arrivals retrieved successfully',
            data: products
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getNewArrivals = getNewArrivals;
const getBestSellers = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query;
        const products = await models_1.Product.find({ isBestSeller: true })
            .sort({ rating: -1, reviews: -1 })
            .limit(parseInt(limit.toString()))
            .lean();
        const response = {
            success: true,
            message: 'Best sellers retrieved successfully',
            data: products
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getBestSellers = getBestSellers;
const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12, sortBy = 'featured' } = req.query;
        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'price-low':
                sort = { price: 1 };
                break;
            case 'price-high':
                sort = { price: -1 };
                break;
            case 'name':
                sort = { name: 1 };
                break;
            default:
                sort = { isFeatured: -1, isBestSeller: -1, rating: -1 };
                break;
        }
        const pageNum = parseInt(page.toString());
        const limitNum = parseInt(limit.toString());
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            models_1.Product.find({ category })
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models_1.Product.countDocuments({ category })
        ]);
        const response = {
            success: true,
            message: `Products in category '${category}' retrieved successfully`,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getCollections = async (req, res, next) => {
    try {
        const collections = await models_1.Collection.find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: -1 })
            .lean();
        const collectionsWithCounts = await Promise.all(collections.map(async (collection) => {
            const productCount = await models_1.Product.countDocuments({
                collection: collection.name
            });
            return { ...collection, productCount };
        }));
        const response = {
            success: true,
            message: 'Collections retrieved successfully',
            data: collectionsWithCounts
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getCollections = getCollections;
const getFilterOptions = async (req, res, next) => {
    try {
        const [categories, brands, sizes, colors, priceRange] = await Promise.all([
            models_1.Product.distinct('category'),
            models_1.Product.distinct('brand'),
            models_1.Product.distinct('sizes'),
            models_1.Product.distinct('colors'),
            models_1.Product.aggregate([
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }
                    }
                }
            ])
        ]);
        const collections = await models_1.Collection.find({ isActive: true }, 'name slug')
            .sort({ sortOrder: 1 })
            .lean();
        const filterOptions = {
            categories: categories.sort(),
            collections: collections.map(c => ({ name: c.name, slug: c.slug })),
            brands: brands.sort(),
            sizes: sizes.flat().filter((size, index, array) => array.indexOf(size) === index).sort(),
            colors: colors.flat().filter((color, index, array) => array.indexOf(color) === index).sort(),
            priceRange: priceRange[0] ? [priceRange[0].minPrice, priceRange[0].maxPrice] : [0, 1000]
        };
        const response = {
            success: true,
            message: 'Filter options retrieved successfully',
            data: filterOptions
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getFilterOptions = getFilterOptions;
const getSearchSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.length < 2) {
            res.status(200).json({
                success: true,
                message: 'Search suggestions retrieved successfully',
                data: []
            });
            return;
        }
        const products = await models_1.Product.find({ $text: { $search: q } }, { name: 1, slug: 1, price: 1, images: 1, category: 1 })
            .limit(5)
            .lean();
        const response = {
            success: true,
            message: 'Search suggestions retrieved successfully',
            data: products
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getSearchSuggestions = getSearchSuggestions;
//# sourceMappingURL=products.js.map