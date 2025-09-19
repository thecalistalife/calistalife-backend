"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.changePassword = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const models_1 = require("@/models");
const auth_1 = require("@/utils/auth");
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }
        const user = await models_1.User.create({
            name,
            email,
            password
        });
        const token = (0, auth_1.generateToken)(user);
        const cookieOptions = (0, auth_1.getCookieOptions)();
        res.cookie('token', token, cookieOptions);
        const response = {
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }
        const user = await models_1.User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        const token = (0, auth_1.generateToken)(user);
        const cookieOptions = (0, auth_1.getCookieOptions)();
        res.cookie('token', token, cookieOptions);
        const userResponse = user.toJSON();
        const response = {
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.cookie('token', '', {
            expires: new Date(0),
            httpOnly: true
        });
        const response = {
            success: true,
            message: 'Logged out successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        const response = {
            success: true,
            message: 'User retrieved successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user._id;
        const fieldsToUpdate = {};
        if (name)
            fieldsToUpdate.name = name;
        if (email)
            fieldsToUpdate.email = email;
        if (phone)
            fieldsToUpdate.phone = phone;
        const user = await models_1.User.findByIdAndUpdate(userId, fieldsToUpdate, {
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
        const response = {
            success: true,
            message: 'Profile updated successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        const user = await models_1.User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!(await user.comparePassword(currentPassword))) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        user.password = newPassword;
        await user.save();
        const response = {
            success: true,
            message: 'Password changed successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const addAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const addressData = req.body;
        const user = await models_1.User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.addresses.length === 0) {
            addressData.isDefault = true;
        }
        if (addressData.isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }
        user.addresses.push(addressData);
        await user.save();
        const response = {
            success: true,
            message: 'Address added successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const addressData = req.body;
        const user = await models_1.User.findById(userId);
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
        if (addressData.isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id?.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }
        Object.assign(address, addressData);
        await user.save();
        const response = {
            success: true,
            message: 'Address updated successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const user = await models_1.User.findById(userId);
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
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        await user.save();
        const response = {
            success: true,
            message: 'Address deleted successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
//# sourceMappingURL=auth.js.map