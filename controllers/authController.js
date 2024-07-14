const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

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
    passwordChangedAt: req.body.passwordChangedAt,
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
  console.log('>> recievedToken: ', recievedToken);

  if (recievedToken && recievedToken.startsWith('Bearer')) {
    token = recievedToken.split(' ')[1];
    console.log('>> token: ', token);
  }

  console.log('before validation');
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to access.', 401),
    );
  }

  // 2) verifying the token
  console.log('here i am!');
  console.log(token);

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded', decoded);

  // 3) check if users still exists

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // 4) check if the user changed password after token was issued

  if (currentUser.isPasswordChanged(decoded.iat)) {
    next(
      new AppError('User recently changed password. Please login again!', 401),
    );
  }

  // 5) Grant access to protected route

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) find the user based on POSTed email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('There is no user with the provided email address', 404),
    );
  }

  // 2) generate a random token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2) if token has not expired and there is user, set the password

  if (!user) {
    return next(new AppError('The token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  // 3) update changedPasswordAt property for the user
  // 4) log the user in, send jwt

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get the user from collection

  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  // console.log('user', user);

  // 2) check if POSTed current password is correct

  if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
    return next(
      new AppError(
        'The password provided is not correct! Please check and try again.',
        401,
      ),
    );
  }

  // 3) update the password

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordChangedAt = Date.now();

  await user.save();

  // 4) login user and send jwt

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});