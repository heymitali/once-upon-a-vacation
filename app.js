const express = require('express');

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

module.exports = app;
