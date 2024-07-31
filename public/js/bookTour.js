import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId, tourPrice) => {
  try {
    // 1) Get checkout session from API
    const res = await axios({
      method: 'POST',
      url: `/api/v1/bookings/${tourId}`,
      data: {
        tour: tourId,
        price: tourPrice,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Booking successful!');

      window.setTimeout(() => {
        location.assign(`/bookTour/${tourId}`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error in booking tour', err);
  }
};
