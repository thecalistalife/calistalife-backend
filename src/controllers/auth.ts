import { Request, Response, NextFunction } from 'express';
import { User } from '@/models';
import { AuthRequest, ApiResponse, IUser } from '@/types';
import { generateAccessToken, generateRefreshToken, getAccessCookieOptions, getRefreshCookieOptions } from '@/utils/auth';
import crypto from 'crypto';
import { sendMail } from '@/utils/email';

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
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, hash, expires } = generateRefreshToken();
    user.refreshTokenHash = hash;
    user.refreshTokenExpires = expires;
    await user.save();

    // Set cookies
    res.cookie('token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token: accessToken
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
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, hash, expires } = generateRefreshToken();
    user.refreshTokenHash = hash;
    user.refreshTokenExpires = expires;
    await user.save();

    res.cookie('token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

    // Remove password from response
    const userResponse = user.toJSON();

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: accessToken
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
    // Attempt to find user by refresh token cookie to revoke
    const rt = (req as any).cookies?.refresh_token as string | undefined;
    if (rt) {
      const hash = crypto.createHash('sha256').update(rt).digest('hex');
      await User.updateOne({ refreshTokenHash: hash }, { $set: { refreshTokenHash: null, refreshTokenExpires: null } });
    }

    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.cookie('refresh_token', '', { expires: new Date(0), httpOnly: true });

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

// Refresh access token using refresh token cookie
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rt = (req as any).cookies?.refresh_token as string | undefined;
    if (!rt) {
      res.status(401).json({ success: false, message: 'No refresh token provided' });
      return;
    }

    const hash = crypto.createHash('sha256').update(rt).digest('hex');
    const user = await User.findOne({ refreshTokenHash: hash }).select('+password');
    if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    // Rotate refresh token
    const { token: newRt, hash: newHash, expires } = generateRefreshToken();
    user.refreshTokenHash = newHash;
    user.refreshTokenExpires = expires;
    await user.save();

    const access = generateAccessToken(user);
    res.cookie('token', access, getAccessCookieOptions());
    res.cookie('refresh_token', newRt, getRefreshCookieOptions());

    res.status(200).json({ success: true, message: 'Token refreshed', data: { token: access } });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // do not reveal existence
      res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = resetHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: 'Reset your password',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`
    });

    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      res.status(400).json({ success: false, message: 'Missing fields' });
      return;
    }
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ email, passwordResetToken: hash, passwordResetExpires: { $gt: new Date() } }).select('+password');
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = null as any;
    user.passwordResetExpires = null as any;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Request email verification (for logged-in user)
export const requestEmailVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (user.emailVerified) {
      res.status(200).json({ success: true, message: 'Email already verified' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    user.emailVerificationToken = hash;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await user.save();

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    await sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Welcome!</p><p>Click <a href="${verifyUrl}">here</a> to verify your email (expires in 24 hours).</p>`
    });

    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
};

// Confirm email verification
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      res.status(400).json({ success: false, message: 'Missing token or email' });
      return;
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ email, emailVerificationToken: hash, emailVerificationExpires: { $gt: new Date() } });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = null as any;
    user.emailVerificationExpires = null as any;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Google login using ID token from frontend
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ success: false, message: 'Missing idToken' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ success: false, message: 'Google client not configured' });
      return;
    }

    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token' });
      return;
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: crypto.randomBytes(16).toString('hex'), googleId, emailVerified: true, avatar: payload.picture || null });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.emailVerified) user.emailVerified = true;
      await user.save();
    }

    // Issue tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, hash, expires } = generateRefreshToken();
    user.refreshTokenHash = hash;
    user.refreshTokenExpires = expires;
    await user.save();

    res.cookie('token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

    res.status(200).json({ success: true, message: 'Login successful', data: { user: user.toJSON(), token: accessToken } });
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