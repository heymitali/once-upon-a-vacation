const express = require('express');
const fs = require('fs');

app.use(express.json());

const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tours: tourData,
    },
  });
};

const createTours = (req, res) => {
  // console.log(req.body);

  // made newId and newTour
  const newId = tourData[tourData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  // push it to the database
  tourData.push(newTour);

  // update the database file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tourData),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Tour created',
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tourData.length) {
    res.status(404).json({
      status: 'fail',
    });
  }

  const result = tourData.find((item) => item.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tourData.length) {
    res.status(404).json({
      status: 'fail',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour data>',
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tourData.length) {
    res.status(404).json({
      status: 'fail',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const router = express.Router();
app.use('/api/v1/tours', router);

router.route('/').get(getAllTours).post(createTours);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
