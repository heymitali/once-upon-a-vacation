const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

// router
//   .route('/')
//   .get(bookingController.getAllBookings)
//   .post(bookingController.createBooking);

// router.route('/:userId').get(bookingController.getAllBookings);
//   .patch(bookingController.updateBooking)
//   .delete(bookingController.deleteBooking);

router
  .route('/:tourId')
  .post(authController.isLoggedIn, bookingController.createBooking)
  .get(authController.protect, bookingController.getBooking);

router
  .route('/myBookings')
  .get(authController.isLoggedIn, bookingController.getAllBookings);

module.exports = router;
