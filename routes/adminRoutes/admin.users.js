const router = require('express').Router()
const mongoose = require('mongoose')
const moment = require('moment')
const Company = mongoose.model('Company')
const User = mongoose.model('User')
const verify = require('../../middleware/verifyToken')
const { admin } = require('../../middleware/permissions')
const { All_Roles } = require('../../middleware/Roles')
const userRoles = Object.values(All_Roles)


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

// get a list of all users
router.route('/')                   // api/users
  .get( verify, admin, async (req, res) => {
    const users = await User.find({}, 'name email _id date role company_id phone.number phone.carrier_gateway')
    if (users) {
      res.status(200).json(users)
    } else {
      res.status(404).json({
        code: 'failure',
        message: 'unable to locate any users'
      })
    }
  })

  // get a list of specific users
router.route('/search')                   // api/users/search
  .get( verify, admin, async (req, res) => {

    var queries = {}
    
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
        if (req.query.company_id) {
          console.log(`query for company_id ${req.query.company_id}`)
          queries['company_id'] = req.query.company_id
          console.log('value of queries == ', queries)
    
        } 
        if (req.query.company_name) {
          console.log(`query for company_name ${req.query.company_name}`)
          queries['company_name'] = { $regex: new RegExp(req.query.company_name, "ig") }
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
}) // end of search route

// get a single user by id
router.route('/:id')                   // api/users/:id
  .get( verify, admin, async (req, res) => {
  res.send('you have reached the GET /users/:id router')
  })
// update a single user info
  .patch( verify, admin, async (req, res) => {
  res.send('you have reached the PATCH /users/:id router')
  })
// delete a single user
  .delete( verify, admin, async (req, res) => {
  res.send('you have reached the DELETE /users/:id router')
  })
// soft-delete a company... set their account to inactive and prevent them or thier employees from logging in
  .put( verify, admin, async (req, res) => {
     res.send('you have reached the PUT /users/:id router') 
  })
module.exports = router