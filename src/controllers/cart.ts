import { Response, NextFunction } from 'express';
import { Cart, Product, Wishlist } from '@/models';
import { AuthRequest, ApiResponse, ICart, IWishlist } from '@/types';

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({ user: userId, items: [] });
    }

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, size, color, quantity = 1 } = req.body;

    // Validate product exists and is in stock
    const product = await Product.findById(productId);
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

    // Validate size and color
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

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, size, color, quantity, product.price);
    
    // Populate and return updated cart
    cart = await Cart.findById(cart._id).populate('items.product');

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Item added to cart successfully',
      data: cart!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, size, color, quantity } = req.body;

    if (quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    await cart.updateItemQuantity(productId, size, color, quantity);
    
    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCart!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, size, color } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    await cart.removeItem(productId, size, color);
    
    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Item removed from cart successfully',
      data: updatedCart!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    await cart.clearCart();

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const response: ApiResponse<IWishlist> = {
      success: true,
      message: 'Wishlist retrieved successfully',
      data: wishlist
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Add item to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Add item to wishlist
    await wishlist.addItem(productId);
    
    // Populate and return updated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate('items.product');

    const response: ApiResponse<IWishlist> = {
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlist!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
      return;
    }

    await wishlist.removeItem(productId);
    
    // Populate and return updated wishlist
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product');

    const response: ApiResponse<IWishlist> = {
      success: true,
      message: 'Item removed from wishlist successfully',
      data: updatedWishlist!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Toggle wishlist item (add if not present, remove if present)
export const toggleWishlistItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Check if item exists in wishlist
    const existingItem = wishlist.items.find(item => 
      item.product.toString() === productId
    );

    let message: string;
    if (existingItem) {
      await wishlist.removeItem(productId);
      message = 'Item removed from wishlist successfully';
    } else {
      await wishlist.addItem(productId);
      message = 'Item added to wishlist successfully';
    }
    
    // Populate and return updated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate('items.product');

    const response: ApiResponse<IWishlist> = {
      success: true,
      message,
      data: wishlist!
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};