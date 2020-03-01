// Company routes
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const moment = require('moment')
const User = mongoose.model('User')
const Company = mongoose.model('Company')
const verify = require('../../middleware/verifyToken')
const { company } = require('../../middleware/permissions')


Object.size = function(obj) {
  var size = 0, key
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++
  }
  return size
}

function checkObj (obj) {
  if (!obj) { return false } else { return true }
}

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

router.route('/search')
  .get(verify, company, async (req, res) => {

    var queries = {}
    queries['company_id'] = req.user._id // only search for members of same compamy
    
    console.log(`The request query is ${checkObj(req.query)}`)
    if (!req.query) {
      console.log('no query available')
      res.status(404).json({
        code: 'failure',
        message: 'unable to locate a query in the URL'
      }) 
    } else if (req.query) {
      try {
        if (req.query.status) {
          console.log(`query for status ${req.query.status}`)
          queries['status'] = req.query.status
          console.log('value of queries == ', queries)
        } 
        if (req.query.on_status_date) {
          console.log(`query for on_status_date ${moment(req.query.on_status_date, 'MM-DD-YYYY')}`)
          queries['on_status_date'] = moment(req.query.on_status_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
        } 
        if (req.query.before_status_date) {
          console.log(`query for before_status_date ${moment(req.query.before_status_date, 'MM-DD-YYYY')}`)
          queries['before_status_date'] = moment(req.query.before_status_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
        } 
        if (req.query.after_status_date) {
          console.log(`query for after_status_date ${moment(req.query.after_status_date, 'MM-DD-YYYY')}`)
          queries['after_status_date'] = moment(req.query.after_status_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
    
        } 
        if (req.query.between_status_date_a && req.query.between_status_date_b) {
          console.log(`query for between ${moment(req.query.between_status_date_a, 'MM-DD-YYYY')} and ${moment(req.query.between_status_date_b, 'MM-DD-YYYY')}`)
          if (moment(req.query.between_status_date_a, 'MM-DD-YYYY') < moment(req.query.between_status_date_b, 'MM-DD-YYYY')) {
            queries['between_status_date_a'] = moment(req.query.between_status_date_a, 'MM-DD-YYYY')
            queries['between_status_date_b'] = moment(req.query.between_status_date_b, 'MM-DD-YYYY')
          } else if (moment(req.query.between_status_date_a, 'MM-DD-YYYY') === moment(req.query.between_status_date_b, 'MM-DD-YYYY')) {
            queries['between_status_date_same'] = moment(req.query.between_status_date_a, 'MM-DD-YYYY')
          } else {
            queries['between_status_date_b'] = moment(req.query.between_status_date_a, 'MM-DD-YYYY')
            queries['between_status_date_a'] = moment(req.query.between_status_date_b, 'MM-DD-YYYY')
          }   
          console.log('value of queries == ', queries) 
        } 
        if (req.query.on_date) {
          console.log(`query for on_date ${moment(req.query.before_date, 'MM-DD-YYYY')}`)
          queries['on_date'] = moment(req.query.on_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
        } 
        if (req.query.before_date) {
          console.log(`query for before_date ${moment(req.query.before_date, 'MM-DD-YYYY')}`)
          queries['before_date'] = moment(req.query.before_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
    
        } 
        if (req.query.after_date) {
          console.log(`query for after_date ${moment(req.query.after_date, 'MM-DD-YYYY')}`)
          queries['after_date'] = moment(req.query.after_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
    
        } 
        if (req.query.between_date_a && req.query.between_date_b) {
          console.log(`query for between ${moment(req.query.between_date_a, 'MM-DD-YYYY')} and ${moment(req.query.between_date_b, 'MM-DD-YYYY')}`)
          if (moment(req.query.between_date_a, 'MM-DD-YYYY') < moment(req.query.between_date_b, 'MM-DD-YYYY')) {
            queries['between_date_a'] = moment(req.query.between_date_a, 'MM-DD-YYYY')
            queries['between_date_b'] = moment(req.query.between_date_b, 'MM-DD-YYYY')
          } else if (moment(req.query.between_date_a, 'MM-DD-YYYY') === moment(req.query.between_date_b, 'MM-DD-YYYY')) {
            queries['between_date_same'] = moment(req.query.between_date_a, 'MM-DD-YYYY')
          } else {
            queries['between_date_b'] = moment(req.query.between_date_a, 'MM-DD-YYYY')
            queries['between_date_a'] = moment(req.query.between_date_b, 'MM-DD-YYYY')
          }   
          console.log('value of queries == ', queries) 
        } 
        if (req.query.like_name) {
          if (!queries.name) {
            console.log(`query for like_name ${req.query.like_name}`)
            queries['name'] = { $regex: new RegExp(req.query.like_name, "ig") }
            console.log(`queries.like_name setting queries.name to ${queries.name}`)
            console.log('value of queries == ', queries)
          }
        } else if (req.query.exact_name) {
          if (!queries.name) {
            console.log(`query for exact_name ${req.query.exact_name}`)
            queries['name'] = req.query.exact_name
            console.log('value of queries == ', queries)
          }
        } 
        if (req.query.role) {
          console.log(`query for role ${req.query.role}`)
          queries['role'] = req.query.role
          console.log('value of queries == ', queries)
    
        } 
        if (req.query.phone_number) {
          console.log(`query for phone_number ${req.query.phone_number}`)
          queries['phone.number'] = { $regex: new RegExp(req.query.phone_number, "ig") }
          console.log('value of queries == ', queries)
    
        }
        if (req.query.phone_carrier) {
          console.log(`query for phone_carrier ${req.query.phone_carrier}`)
          queries['phone.carrier'] = { $regex: new RegExp(req.query.phone_carrier, "ig") }
          console.log('value of queries == ', queries)
    
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      console.log('no available queries found')
      res.status(404).json({
        code: 'failure',
        message: 'Unable to locate a query in the URL'
      }) 
    }
    
    // FINAL CHECK FOR ALL QUERIES 
    if (Object.size(queries) == 0) {
      console.log('queries object is 0')
      // catch ALL 
      res.status(400).json({
        code: 'failure',
        message: 'Unable to locate a correctly structured query in URL'
      })
    } else {
      console.log(`number of queries = ${Object.size(queries)}`)
      console.log('value of queries == ', queries)
      // do an await find on ALL users with the filter parameters = queries
      try {
        // status date
        if ( 'on_status_date' in queries || 'between_status_date_same' in queries ) {     // any users date that is the same date as the query date
          // if 'date' already exists... delete the query from queries so 'date' isn't overwritten
          if ('status_date' in queries) {
            console.log('deleting date queries on_status_date && between_status_date_same')
            delete queries.on_status_date
            delete queries.between_status_date_same
          } else {
            if ('on_status_date' in queries) {
              console.log(`searching for users added ON ${ queries.on_status_date }`)
              const day = queries.on_status_date.startOf('day')
              queries['date'] = {
                $gte: day.toDate(),
                $lte: moment(day).endOf('day').toDate
              }
              // remove custom query, so only the applicable 'date' is available
              console.log('deleting date queries on_status_date')
              delete queries.on_status_date
            } else {
              console.log(`searching for users added 'between' ${ queries.between_status_date_same }`)
              const day = queries.between_status_date_same.startOf('day')
              queries['date'] = {
                $gte: day.toDate(),
                $lte: moment(day).endOf('day').toDate
              }
              // remove custom query, so only the applicable 'date' is available
              console.log('deleting date queries between_status_date_same')
              delete queries.between_status_date_same
            }
          }
        }

        // date
        if ( 'on_date' in queries || 'between_date_same' in queries ) {     // any users date that is the same date as the query date
          // if 'date' already exists... delete the query from queries so 'date' isn't overwritten
          if ('date' in queries) {
            console.log('deleting date queries on_date && between_date_same')
            delete queries.on_date
            delete queries.between_date_same
          } else {
            if ('on_date' in queries) {
              console.log(`searching for users added ON ${ queries.on_date }`)
              const day = queries.on_date.startOf('day')
              queries['date'] = {
                $gte: day.toDate(),
                $lte: moment(day).endOf('day').toDate
              }
              // remove custom query, so only the applicable 'date' is available
              console.log('deleting date queries on_date')
              delete queries.on_date
            } else {
              console.log(`searching for users added 'between' ${ queries.between_date_same }`)
              const day = queries.between_date_same.startOf('day')
              queries['date'] = {
                $gte: day.toDate(),
                $lte: moment(day).endOf('day').toDate
              }
              // remove custom query, so only the applicable 'date' is available
              console.log('deleting date queries between_date_same')
              delete queries.between_date_same
            }
          }
        }
        if ('before_date' in queries) { // any users date that is less than the query date
          // if 'date' already exists... delete the query from queries so 'date' isn't overwritten
          if ('date' in queries) {
            console.log('deleting date queries before_date')
            delete queries.before_date
          } else {
            console.log(`searching for users added before ${ queries.before_date }`)
            queries['date'] = {
              $lte: queries.before_date
            }
            // remove custom query, so only the applicable 'date' is available
            console.log('deleting date queries before')
            delete queries.before_date
          }
        }
        if ('after_date' in queries) { // any users date that is greater than the query date
          // if 'date' already exists... delete the query from queries so 'date' isn't overwritten
          if ('date' in queries) {
            console.log('deleting date queries after_date')
            delete queries.after_date
          } else {
            console.log(`searching for users added after ${ queries.after_date }`)
            queries['date'] = {
              $gte: queries.after_date
            }
            // remove custom query, so only the applicable 'date' is available
            console.log('deleting date queries after_date')
            delete queries.after_date
          }
        }
        if ('between_date_a' in queries && 'between_date_b' in queries) { // any users date that falls between date_a(earlier) and date_b(later)
          // if 'date' already exists... delete the query from queries so 'date' isn't overwritten
          if ('date' in queries) {
            console.log('deleting date queries between_date_a && between_date_b')
            delete queries.between_date_a
            delete queries.between_date_b
          } else {
            console.log(`searching for users added after ${ queries.after_date }`)
            queries['date'] = {
              $gte: queries.between_date_a,
              $lte: queries.between_date_b
            }
            // remove custom query, so only the applicable 'date' is available
            console.log('deleting date queries between_date_a && between_date_b')
            delete queries.between_date_a
            delete queries.between_date_b
          }
        }
        const filter = queries
        const hidden = { password: 0, __v: 0 }
        const Users = await User.find( filter, hidden )
        if (Users.length > 0) {
          console.log('queries = ', queries)
          // console.log('users = ', Users)
          res.send(Users)
        } else {
          res.status(400).json({
            code: 'failure',
            message: 'Unable to locate users matching the queries given'
          })
        }
      } catch  (err) {
        console.log(err)
      }
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

// Older version of search
// // GET FILTERED LIST OF USERS   /api/company/users/search
// router.route('/search')
//   .get(verify, company, async (req, res) => {
//     // query for role-type
//     if (req.query.role) {
//       res.send('role stuff')
//     } else
//     // query for status
//     if (req.query.status) {
//       res.send('status stuff')
//     } else
//     /**
//      * DATE FORMAT: new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
//      * 2019-12-07T23:10:54.250Z
//      */
//     // query for before date 
//     if (req.query.before_date) {
//       var results = []
//       // res.send(`employees before date ${req.query.date_before}`)
//       const employees = await User.find({company_id: req.user._id}, { password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0 })
//       if (employees) {
//         try {
//           const queryDate = req.query.before_date
//           const before = moment(queryDate)
//           for (var i = 0; i < employees.length; i++) {
//             var tmp = moment(employees[i].date)
//             if (tmp.isSameOrBefore(before, 'day')) {
//               results.push(employees[i])
//             }
//           }
//           // console.log(results)
//           if (results.length === 0){
//             res.status(401).send({
//               code: 'failure',
//               message: 'no results were found, based on date given',
//               date: req.query.before_date,
//               number_of_results: results.length
//             })
//           } else {
//             res.send(results)
//           }
//         } catch (err) {
//           res.status(400).json({
//             code: 'failure',
//             message: 'malformed user_id or some other issue caused an error',
//             error: err
//           })
//         }
//       } else {
//         res.status(401).send({
//           code: 'failure',
//           message: 'no employees could be found, there could have been an error with the server.'
//         })
//       }

//     } else
//     // query for after date
//     if (req.query.after_date) {
//       var results = []
//       // res.send(`employees before date ${req.query.date_before}`)
//       const employees = await User.find({company_id: req.user._id}, {password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0})
//       if (employees) {
//         try {
//           const queryDate = req.query.after_date
//           const after = moment(queryDate)
//           for (var i = 0; i < employees.length; i++) {
//               var tmp = moment(employees[i].date)
//               if (tmp.isSameOrAfter(after, 'day')) {
//                 results.push(employees[i])
//               }
//           }
//           // console.log(results)
//           if (results.length === 0){
//             res.status(401).send({
//               code: 'failure',
//               message: 'no results were found, based on date given',
//               date: req.query.after_date,
//               number_of_results: results.length
//             })
//           } else {
//             res.send(results)
//           }
//         } catch (err) {
//           console.log(err)
//         }
//       } else {
//         res.status(401).send({
//           code: 'failure',
//           message: 'no employees could be found, there could have been an error with the server.'
//         })
//       }
//     } else
//     // query for date
//     if (req.query.on_date) {
//       var results = []
//       // res.send(`employees before date ${req.query.date_before}`)
//       const employees = await User.find({company_id: req.user._id}, {password: 0, __v: 0, company_id: 0, company_name: 0, "phone.carrier": 0})
//       if (employees) {
//         try {
//           var queryDate = req.query.on_date
//           var exact = moment(queryDate)
//           for (var i = 0; i < employees.length; i++) {
//             console.log(moment(employees[i].date).isSame(exact, 'day'))
//             console.log(`employee: ${moment(employees[i].date)} compared to query: ${exact}`)
//             if (moment(employees[i].date).isSame(exact, 'day')){
//               results.push(employees[i])
//             }
//           }
//           // console.log(results)
//           if (results.length === 0){
//             res.status(401).send({
//               code: 'failure',
//               message: 'no results were found, based on date given',
//               date: req.query.on_date,
//               number_of_results: results.length
//             })
//           } else {
//             res.send(results)
//           }
//         } catch (err) {
//           console.log(err)
//         }
//       } else {
//         res.status(401).send({
//           code: 'failure',
//           message: 'no employees could be found, there could have been an error with the server.'
//         })
//       }
//     }
//   })


module.exports = router