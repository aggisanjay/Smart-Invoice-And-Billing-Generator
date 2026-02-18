import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, businessName } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, businessName });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      theme: user.theme,
    },
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      theme: user.theme,
      currency: user.currency,
    },
  });
});

// @desc   Get logged-in user profile
// @route  GET /api/auth/profile
// @access Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const fields = [
    'name',
    'businessName',
    'businessLogo',
    'address',
    'phone',
    'taxId',
    'currency',
    'theme',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });

  if (req.body.password) user.password = req.body.password;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res.json({ success: true, user: userObj });
});
