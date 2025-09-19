import { Request, Response, NextFunction } from 'express';
import { Product, Collection } from '@/models';
import { AuthRequest, ApiResponse, IProduct, ProductQuery, SortOption } from '@/types';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      collection,
      brand,
      minPrice,
      maxPrice,
      sizes,
      colors,
      inStock,
      sortBy = 'featured'
    }: ProductQuery = req.query;

    // Build filter object
    const filter: any = {};

    // Search in name, description, and tags
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by collection
    if (collection) {
      filter.collection = collection;
    }

    // Filter by brand
    if (brand) {
      filter.brand = brand;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Filter by sizes
    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      filter.sizes = { $in: sizeArray };
    }

    // Filter by colors
    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : [colors];
      filter.colors = { $in: colorArray };
    }

    // Filter by stock status
    if ((inStock as any) === 'true' || inStock === true) {
      filter.inStock = true;
    }

    // Build sort object
    let sort: any = {};
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

    // Calculate pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const response: ApiResponse<IProduct[]> = {
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
  } catch (error) {
    next(error);
  }
};

// Get single product by ID or slug
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findById(id);
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const response: ApiResponse<IProduct> = {
      success: true,
      message: 'Product retrieved successfully',
      data: product
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit.toString()))
      .lean();

    const response: ApiResponse<IProduct[]> = {
      success: true,
      message: 'Featured products retrieved successfully',
      data: products
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get new arrivals
export const getNewArrivals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isNew: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit.toString()))
      .lean();

    const response: ApiResponse<IProduct[]> = {
      success: true,
      message: 'New arrivals retrieved successfully',
      data: products
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get best sellers
export const getBestSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isBestSeller: true })
      .sort({ rating: -1, reviews: -1 })
      .limit(parseInt(limit.toString()))
      .lean();

    const response: ApiResponse<IProduct[]> = {
      success: true,
      message: 'Best sellers retrieved successfully',
      data: products
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'featured' } = req.query;

    let sort: any = {};
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
      Product.find({ category })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments({ category })
    ]);

    const response: ApiResponse<IProduct[]> = {
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
  } catch (error) {
    next(error);
  }
};

// Get all collections
export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    // Get product counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const productCount = await Product.countDocuments({ 
          collection: collection.name 
        });
        return { ...collection, productCount };
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Collections retrieved successfully',
      data: collectionsWithCounts
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get filter options (categories, brands, sizes, colors, price range)
export const getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [categories, brands, sizes, colors, priceRange] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('brand'),
      Product.distinct('sizes'),
      Product.distinct('colors'),
      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ])
    ]);

    const collections = await Collection.find({ isActive: true }, 'name slug')
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

    const response: ApiResponse = {
      success: true,
      message: 'Filter options retrieved successfully',
      data: filterOptions
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Search suggestions
export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const products = await Product.find(
      { $text: { $search: q } },
      { name: 1, slug: 1, price: 1, images: 1, category: 1 }
    )
      .limit(5)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Search suggestions retrieved successfully',
      data: products
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};