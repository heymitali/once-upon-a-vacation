import axios from 'axios';
import { showAlert } from './alert';

export const myBookings = async () => {
  try {
    // 1) Get checkout session from API
    const bookings = await axios({
      method: 'GET',
      url: `/api/v1/bookings/myBookings`,
    });
    if (bookings.data.status === 'success') {
      window.setTimeout(() => {
        location.assign(`/myBookings}`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error in booking tour', err);
  }
};
