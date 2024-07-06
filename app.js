const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use(express.json());

// MIDDLEWARES
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log('Hello from the middleware !');
  next();
});

// ROUTE HANDLERS
const getRoot = (req, res) => {
  res.status(200).json({
    message: 'Hi there! This is my server and i created it.',
    project: 'natours',
  });
};

const postRoot = (req, res) => {
  res.status(200).json({ name: 'Rachel Green', age: '30' });
};

// ROUTES

app.route('/').get(getRoot).post(postRoot);

// Requests to /api/v1/tours will pass through tourRouter and same for the other
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
