const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connecting monoDB with our app
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB sucessfully connected !');
  });

const app = require('./app');

// SERVER
const port = process.env.PORT;
app.listen(port, () => {
  console.log('The app is running on port', port, '...');
});
