const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

// MIDDLEWARES
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

// SERVER
const port = 3000;
app.listen(port, () => {
  console.log('The app is running on port', port, '...');
});
