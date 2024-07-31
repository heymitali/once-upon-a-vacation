const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/', viewsController.getEntryPage);
router.get('/overview', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/bookingConfirm/:tourId',
  authController.protect,
  viewsController.bookTour,
);

router.get(
  '/bookTour/:tourId',
  authController.isLoggedIn,
  // authController.protect,
  viewsController.bookTour,
);

router
  .route('/signup')
  .get(authController.isLoggedIn, viewsController.getSignupForm);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

router.get(
  '/myBookings',
  authController.isLoggedIn,
  viewsController.getMyBookings,
);

module.exports = router;
