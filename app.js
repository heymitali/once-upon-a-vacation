const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hi there! This is my server and i created it.',
    project: 'natours',
  });
});

// app.post('/', (req, res) => {
//   res.status(200).json({ name: 'Rachel Green', age: '30' });
// });

const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  console.log('Rsponse is there.');
  res.status(200).json({
    status: 'success',
    data: {
      tours: tourData,
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log('The app is running on port', port, '...0');
});
