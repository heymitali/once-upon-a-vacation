const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if we have email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // check if user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    next(new AppError('Incorrect email or password!', 401));
  }

  // if everything ok, send token to client

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) getting the token and check if it's there

  const recievedToken = req.headers.authorization;

  if (recievedToken && recievedToken.startsWith('Bearer')) {
    token = recievedToken.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to access.', 401),
    );
  }

  // 2) verifying the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  next();
});
