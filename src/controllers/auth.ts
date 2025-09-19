import { Request, Response, NextFunction } from 'express';
import { User } from '@/models';
import { AuthRequest, ApiResponse, IUser } from '@/types';
import { generateToken, getCookieOptions } from '@/utils/auth';

// Register user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
      return;
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    // Remove password from response
    const userResponse = user.toJSON();

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true
    });

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user!._id;

    const fieldsToUpdate: Partial<IUser> = {};
    
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (phone) fieldsToUpdate.phone = phone;

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'Profile updated successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Add address
export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const addressData = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    // If setting as default, unset other addresses
    if (addressData.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'Address added successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { addressId } = req.params;
    const addressData = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const address = user.addresses.find(a => a._id?.toString() === addressId);
    
    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    // If setting as default, unset other addresses
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id?.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    Object.assign(address, addressData);
    await user.save();

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'Address updated successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const address = user.addresses.find(a => a._id?.toString() === addressId);
    
    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    const wasDefault = address.isDefault;
    user.addresses = user.addresses.filter(a => a._id?.toString() !== addressId);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const response: ApiResponse<IUser> = {
      success: true,
      message: 'Address deleted successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};