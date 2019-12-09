// Company routes
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const moment = require('moment')
const User = mongoose.model('User')
const Company = mongoose.model('Company')
const verify = require('../../middleware/verifyToken')
const { company } = require('../../middleware/permissions')

// GET ALL USERS  /api/company/users AND /api/company/users?someQuery=something&yadda-yadda
router.route('/')
  .get(verify, company, async (req, res) => {
    console.log(`logged in as ${req.user.role}`)
    if (req.user._id) {    // ONLY ALLOW COMPANY ACCESS TO THE COMPANY ROUTES (NOT THE OWNER)
      try {
        // find users by their company_id. Return resultes with phone, password, company_name, company_id, and __v omitted.
        Users = await User.find({company_id: req.user._id}, { "phone.carrier": 0, password: 0, company_id: 0, company_name: 0, __v: 0 })
        if (Users) {
          console.log('trying non-query route')
          res.status(200).json(Users)
        } else {
          res.status(400).json({
            code: 'failure',
            message: 'unable to locate user data for company_id',
            company_id: req.user._id
          })
        }
      } catch (err) {
        res.status(400).json({
          code: 'failure',
          message: 'malformed user_id or some other issue caused an error',
          error: err
        })
      }
    } else {                  // Catch All and send 4xx error status code
      console.log('trying catch all')
      res.status(400).json({
        code: 'failure',
        message: 'not qualified to make this request'
      })
    }
  })

// GET ONE USER   /api/company/users/:id
router.route('/:id')
  .get(verify, company, async (req, res) => {
    if (req.user._id && req.params.id) {
      try {
        // find a single user by thier _id, that belongs to company_id === req.user._id
        const foundUser = await User.findOne({_id: req.params.id, company_id: req.user._id}, { "phone.carrier": 0, password: 0, company_id: 0, company_name: 0, __v: 0 })
        if (foundUser) {
          res.send(foundUser) // only one user
        } else {
          res.status(400).json({
            code: 'failure',
            message: `unable to locate the user for company_id: ${req.user._id}` ,
            user_id: req.params.id
          })
        }
      } catch (err) {
        res.status(400).json({
          code: 'failure',
          message: 'malformed user_id or some other issue caused an error',
          error: err
        })
      }
    } else {
      console.log('trying catch all')
      res.status(400).json({
        code: 'failure',
        message: 'not qualified to make this request'
      })
    }
  })

// GET FILTERED LIST OF USERS   /api/company/users/search
router.route('/search')
  .get(verify, company, async (req, res) => {
    // query for role-type
    if (req.query.role) {
      res.send('role stuff')
    } else
    // query for status
    if (req.query.status) {
      res.send('status stuff')
    } else
    /**
     * DATE FORMAT: new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
     * 2019-12-07T23:10:54.250Z
     */
    // query for before date 
    if (req.query.before_date) {
      var results = []
      // res.send(`employees before date ${req.query.date_before}`)
      const employees = await User.find({company_id: req.user._id}, { password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0 })
      if (employees) {
        try {
          const queryDate = req.query.before_date
          const before = moment(queryDate)
          for (var i = 0; i < employees.length; i++) {
            var tmp = moment(employees[i].date)
            if (tmp.isSameOrBefore(before, 'day')) {
              results.push(employees[i])
            }
          }
          // console.log(results)
          if (results.length === 0){
            res.status(401).send({
              code: 'failure',
              message: 'no results were found, based on date given',
              date: req.query.before_date,
              number_of_results: results.length
            })
          } else {
            res.send(results)
          }
        } catch (err) {
          res.status(400).json({
            code: 'failure',
            message: 'malformed user_id or some other issue caused an error',
            error: err
          })
        }
      } else {
        res.status(401).send({
          code: 'failure',
          message: 'no employees could be found, there could have been an error with the server.'
        })
      }

    } else
    // query for after date
    if (req.query.after_date) {
      var results = []
      // res.send(`employees before date ${req.query.date_before}`)
      const employees = await User.find({company_id: req.user._id}, {password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0})
      if (employees) {
        try {
          const queryDate = req.query.after_date
          const after = moment(queryDate)
          for (var i = 0; i < employees.length; i++) {
              var tmp = moment(employees[i].date)
              if (tmp.isSameOrAfter(after, 'day')) {
                results.push(employees[i])
              }
          }
          // console.log(results)
          if (results.length === 0){
            res.status(401).send({
              code: 'failure',
              message: 'no results were found, based on date given',
              date: req.query.after_date,
              number_of_results: results.length
            })
          } else {
            res.send(results)
          }
        } catch (err) {
          console.log(err)
        }
      } else {
        res.status(401).send({
          code: 'failure',
          message: 'no employees could be found, there could have been an error with the server.'
        })
      }
    } else
    // query for date
    if (req.query.on_date) {
      var results = []
      // res.send(`employees before date ${req.query.date_before}`)
      const employees = await User.find({company_id: req.user._id}, {password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0})
      if (employees) {
        try {
          var queryDate = req.query.on_date
          var exact = moment(queryDate)
          for (var i = 0; i < employees.length; i++) {
            console.log(moment(employees[i].date).isSame(exact, 'day'))
            console.log(`employee: ${moment(employees[i].date)} compared to query: ${exact}`)
            if (moment(employees[i].date).isSame(exact, 'day')){
              results.push(employees[i])
            }
          }
          // console.log(results)
          if (results.length === 0){
            res.status(401).send({
              code: 'failure',
              message: 'no results were found, based on date given',
              date: req.query.on_date,
              number_of_results: results.length
            })
          } else {
            res.send(results)
          }
        } catch (err) {
          console.log(err)
        }
      } else {
        res.status(401).send({
          code: 'failure',
          message: 'no employees could be found, there could have been an error with the server.'
        })
      }
    }
  })
module.exports = router