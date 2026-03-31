const express = require('express');
const studentRoute = express.Router();
// rate limiting
const RateLimit = require('express-rate-limit');

const deleteStudentLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 delete requests per windowMs
});

const listStudentsLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 list requests per windowMs
});

// model
let StudentModel = require('../models/Student');
studentRoute.route('/create-student').post((req, res, next) => {
  StudentModel.create(req.body, (error, data) => {
  if (error) {
    return next(error)
  } else {
    res.json(data)
  }
})
});
studentRoute.route('/').get(listStudentsLimiter, (req, res, next) => {
    StudentModel.find((error, data) => {
     if (error) {
       return next(error)
     } else {
       res.json(data)
     }
   })
 })
studentRoute.route('/edit-student/:id').get((req, res, next) => {
   StudentModel.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})
// Update
studentRoute.route('/update-student/:id').put((req, res, next) => {
  // Only allow specific fields to be updated to prevent injection of MongoDB operators
  const allowedUpdateFields = ['name', 'email', 'age']; // adjust this list to match Student schema
  const updateData = {};

  allowedUpdateFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update.' });
  }

  StudentModel.findByIdAndUpdate(req.params.id, {
    $set: updateData
  }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data)
      console.log('Student successfully updated!')
    }
  })
})
// Delete
studentRoute.route('/delete-student/:id').delete(deleteStudentLimiter, (req, res, next) => {
  StudentModel.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})
module.exports = studentRoute;