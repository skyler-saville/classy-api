const router = require('express').Router()
const mongoose = require('mongoose')
const moment = require('moment')
const Company = mongoose.model('Company')
const User = mongoose.model('User')
const verify = require('../../middleware/verifyToken')
const { admin } = require('../../middleware/permissions')
const { phoneValidate, nameOnlyValidation, statusOnlyValidation } = require('../../validation')
const possible_status = ['pending', 'active', 'disabled', 'deleted']


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
    const companies = await Company.find({}, 'name email role status date _id')
    if (companies) {
      res.status(200).json(companies)
    } else {
      res.status(404).json({
        code: 'failure',
        message: 'unable to locate companies'
      })
    }
    
  })

// get a list of specific companies
router.route('/search')                   // api/companies/search
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
        // status search
        if (req.query.status) {
          console.log(`query for status ${req.query.status}`)
          queries['status'] = req.query.status
          console.log('value of queries == ', queries)
        } 
        // specific date search
        if (req.query.on_date) {
          console.log(`query for on_date ${moment(req.query.before_date, 'MM-DD-YYYY')}`)
          queries['on_date'] = moment(req.query.on_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
        } 
        // search before specific date
        if (req.query.before_date) {
          console.log(`query for before_date ${moment(req.query.before_date, 'MM-DD-YYYY')}`)
          queries['before_date'] = moment(req.query.before_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
    
        } 
        // search after specific date
        if (req.query.after_date) {
          console.log(`query for after_date ${moment(req.query.after_date, 'MM-DD-YYYY')}`)
          queries['after_date'] = moment(req.query.after_date, 'MM-DD-YYYY')
          console.log('value of queries == ', queries)
    
        } 
        // search between two specific dates
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
        // search based on a company id
        if (req.query.company_id) {
          console.log(`query for company_id ${req.query.company_id}`)
          queries['_id'] = req.query.company_id
          console.log('value of queries == ', queries)
    
        } 
        // search based similar to company name
        if (req.query.company_name) {
          console.log(`query for company_name ${req.query.company_name}`)
          queries['name'] = { $regex: new RegExp(req.query.company_name, "ig") }
          console.log('value of queries == ', queries)
    
        } 
        // search based similar to email
        if (req.query.email) {
          console.log(`query for email ${req.query.email}`)
          queries['email'] = { $regex: new RegExp(req.query.email, "ig") }
          console.log('value of queries == ', queries)
    
        } 
        // search by aprox phone number
        // if (req.query.phone_number) {
        //   console.log(`query for phone_number ${req.query.phone_number}`)
        //   queries['phone.number'] = { $regex: new RegExp(req.query.phone_number, "ig") }
        //   console.log('value of queries == ', queries)
    
        // }
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
        const Companies = await Company.find( filter, hidden )
        if (Companies.length > 0) {
          console.log('queries = ', queries)
          // console.log('users = ', Users)
          res.send(Companies)
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
 

// get a single company by id
router.route('/:id')                   // api/companies/:id
  .get( verify, admin, async (req, res) => {
    const thiscompany = await Company.findById(req.params.id, 'status status.date phone.number name email name date _id')
    if (thiscompany) {
      res.json(thiscompany)
    } else {
      res.status(404).json({
        code: 'failure',
        message: 'unable to locate the requested entity, based on the provided parameters'
      })
    }
    
  })
// hard-delete a single COMPANY and ALL EMPLOYEES by setting account status to 'deleted' and setting the status.date to now
// req.query.hard = true ----> HARD DELETE (REMOVE FROM DATABASE)
  .delete( verify, admin, async (req, res) => {
    if (req.query.hard === 'true') {
      // do a database delete for all users
      try {
        console.log('---------- inside the TRY of DELETE companies/:id')
        // locate ALL employees of the company and change their status
        let deleted_employees = [] // array for all updated employees
        const employees = await User.find({company_id: req.params.id}, { password: 0 })
        try {
          if (Object.size(employees) == 0) {
            console.log('there are no employees connected to this company')
          } else {
            // loop through the employees
            for (const key of  Object.keys(employees)) {
              console.log('found employee #', employees[key]._id)
              let employee_id = employees[key]._id
              const employee_options = {
                fields: 'status status_date name email date phone.number',
                useFindAndModify: false
              }
              let this_employee = await User.findByIdAndremove(employee_id, employee_options)
              if (this_employee) {
                console.log(`deleted employee ${ employee_id } on ${ moment() }`)
                deleted_employees.push(employees[key]._id) // append employee's id to the array
              } else {
                console.log(`unable to delete ${ employee_id }`)
              }
            }
          }
        } catch (err) {
          console.log(err)
        }
        const filter = { _id: req.params.id }
        const options = {
          new: true,
          useFindAndModify: false,
          fields: 'date role status status_date email phone.number'
        }
        // loop through the employees object and update each ones status
        let success_message
        if (deleted_employees.length > 1) {
          success_message = `updated company and ${deleted_employees.length} employees to ${req.body.status} status`
        } else if (deleted_employees.length == 1) {
          success_message = `updated company and ${deleted_employees.length} employee to ${req.body.status} status`
        } else { 
          success_message = `succesfully removed company`
        }
        let this_company = await Company.findOneAndRemove(filter, options)
        if (this_company){ res.json({ 
          code: 'success',
          message: success_message,
          removed: this_company,
          deleted_employees // include the updated employees array
        })
      } else { res.status(400).json({
        code: 'failure',
        message: "update on user failed"})}
    } catch(err) {
      console.log(err)
      res.status(400).json({
        code: 'failure',
        message: err,
        type: 'catch-all error'
      })
    }
    } else {
      const STATUS = 'deleted'
      try {
          console.log('---------- inside the TRY of DELETE companies/:id')
          // locate ALL employees of the company and change their status
          let deleted_employees = [] // array for all updated employees
          const employees = await User.find({company_id: req.params.id}, { password: 0 })
          try {
            if (Object.size(employees) == 0) {
              console.log('there are no employees connected to this company')
            } else {
              // loop through the employees
              for (const key of  Object.keys(employees)) {
                console.log('found employee #', employees[key]._id)
                let employee_filter = employees[key]._id
                const employee_update = {
                  'status': STATUS,
                  'status_date': moment()
                }
                const employee_options = {
                  fields: 'status status_date name email date phone.number',
                  useFindAndModify: false
                }
                let this_employee = await User.findByIdAndUpdate(employee_filter, employee_update, employee_options)
                if (this_employee) {
                  console.log(`set employee ${ employee_filter } status to ${ employee_update.status } on ${ employee_update.status_date }`)
                  deleted_employees.push(employees[key]._id) // append employee's id to the array
                } else {
                  console.log(`unable to update ${ employee_filter } to ${ employee_update.status } status`)
                }
              }
            }
          } catch (err) {
            console.log(err)
          }
          const filter = { _id: req.params.id }
          const update = { 
            'status': STATUS,
            'status_date': moment() 
          } // create a way to inform the user of the status change
          const options = {
            new: true,
            useFindAndModify: false,
            fields: 'date role status status_date email phone.number'
          }
          // loop through the employees object and update each ones status
          let success_message
          if (deleted_employees.length > 1) {
            success_message = `updated company and ${deleted_employees.length} employees to ${req.body.status} status`
          } else if (deleted_employees.length == 1) {
            success_message = `updated company and ${deleted_employees.length} employee to ${req.body.status} status`
          } else { 
            success_message = `updated company to ${req.body.status} status`
          }
          let this_company = await Company.findOneAndUpdate(filter, update, options)
          if (this_company){ res.json({ 
            code: 'success',
            message: success_message,
            removed: this_company,
            deleted_employees // include the updated employees array
          })
        } else { res.status(400).json({
          code: 'failure',
          message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err,
          type: 'catch-all error'
        })
      }
    }
  })
// soft-delete a single COMPANY and ALL EMPLOYEES by setting account status to 'inactive' and setting the status.date to now
  .put( verify, admin, async (req, res) => {
    const STATUS = 'inactive'
    try {
      console.log('---------- inside the TRY of DELETE companies/:id')
      // locate ALL employees of the company and change their status
      let inactivated_employees = [] // array for all updated employees
      const employees = await User.find({company_id: req.params.id}, { password: 0 })
      try {
        if (Object.size(employees) == 0) {
          console.log('there are no employees connected to this company')
        } else {
          // loop through the employees
          for (const key of  Object.keys(employees)) {
            console.log('found employee #', employees[key]._id)
            let employee_filter = employees[key]._id
            const employee_update = {
              'status': STATUS,
              'status_date': moment()
            }
            const employee_options = {
              fields: 'status status_date name email date phone.number',
              useFindAndModify: false
            }
            let this_employee = await User.findByIdAndUpdate(employee_filter, employee_update, employee_options)
            if (this_employee) {
              console.log(`set employee ${ employee_filter } status to ${ employee_update.status } on ${ employee_update.status_date }`)
              inactivated_employees.push(employees[key]._id) // append employee's id to the array
            } else {
              console.log(`unable to update ${ employee_filter } to ${ employee_update.status } status`)
            }
          }
        }
      } catch (err) {
        console.log(err)
      }
      const filter = { _id: req.params.id }
      const update = { 
        'status': STATUS,
        'status_date': moment() 
      } // create a way to inform the user of the status change
      const options = {
        new: true,
        useFindAndModify: false,
        fields: 'date role status status_date email phone.number'
      }
      // loop through the employees object and update each ones status
      let success_message
      if (inactivated_employees.length > 1) {
        success_message = `updated company and ${inactivated_employees.length} employees to ${req.body.status} status`
      } else if (inactivated_employees.length == 1) {
        success_message = `updated company and ${inactivated_employees.length} employee to ${req.body.status} status`
      } else { 
        success_message = `updated company to ${req.body.status} status`
      }
      let this_company = await Company.findOneAndUpdate(filter, update, options)
      if (this_company){ res.json({ 
        code: 'success',
        message: success_message,
        removed: this_company,
        inactivated_employees // include the updated employees array
      })
    } else { res.status(400).json({
      code: 'failure',
      message: "update on user failed"})}
  } catch(err) {
    console.log(err)
    res.status(400).json({
      code: 'failure',
      message: err,
      type: 'catch-all error'
    })
  } 
  })

// update phone-number
router.route('/:id/phone-number')
  .patch( verify, admin, async (req, res) => {
    const { error } = phoneValidate(req.body)
    if (error) {
      return res.status(400).json({
        code: 'failure',
        message: 'validation error',
        error: error.details[0].message
      }) // bad request
    } else {
      try {
          console.log('---------- inside the TRY of PATCH /:id/phone-number')
          // replace {number} with this.phone.number on the gateway value and set phone.carrier_gateway to this new string
          // create a function for it
          
          const filter = { _id: req.params.id }
          const update = { 'phone.number': req.body.phone.number } // companies do not have carrier info or gateways
          const options = { 
            new: true,
            useFindAndModify: false,
            fields: 'phone.number name email date status status_date'
          }
          let this_company = await Company.findOneAndUpdate(filter, update, options)
          if (this_company){ res.json({ 
            updated: this_company
          })
        } else { res.status(400).json({
          code: 'failure',
          message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err
        })
      }
    }
  })

// update company name
router.route('/:id/name')
  .patch( verify, admin, async (req, res) => {
    const { error } = nameOnlyValidation(req.body)
    if (error) {
      return res.status(400).json({
        code: 'failure',
        message: 'validation error',
        error: error.details[0].message
      }) // bad request
    } else {
      try {
          console.log('---------- inside the TRY of PATCH /:id/name')
          const filter = { _id: req.params.id }
          const update = { 'name': req.body.name } 
          let this_company = await Company.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: false,
            fields: 'status name email date phone.number' // returns: name email date _id phone.number
          })
          if (this_company) { 
            res.status(201).json({ code: 'success', message: `companys name was updated to ${req.body.name}`, this_company })
        } else { res.status(400).json({
          code: 'failure',
          message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err
        })
      }
    }
  })

  // update company status
router.route('/:id/status')
.patch( verify, admin, async (req, res) => {
  const { error } = statusOnlyValidation(req.body)
  if (error) {
    return res.status(400).json({
      code: 'failure',
      message: 'validation error',
      error: error.details[0].message
    }) // bad request
  } else {
    try {
        console.log('---------- inside the TRY of PATCH companies/:id/status')

        const filter = { _id: req.params.id }
        const update = { 
          'status': req.body.status,
          'status_date': moment() 
        } // create a way for the user to receive a text message and remove the '_Pending'
        let this_company = await Company.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false,
          fields: 'status status_date name email date phone.number' // returns: name email date _id phone.number
        })
        if (this_company){ 
          res.status(201).json({
            code: 'success',
            message: 'updated company status',
            updated: this_company
        })
      } else { res.status(400).json({
        code: 'failure',
        message: "update on user failed"})}
    } catch(err) {
      console.log(err)
      res.status(400).json({
        code: 'failure',
        message: err
      })
    }
  }
})

// update company-wide status (provided by req.body.status)
router.route('/:id/company-wide-status')
  .patch( verify, admin, async (req, res) => {
    const { error } = statusOnlyValidation(req.body)
    if (error) {
      return res.status(400).json({
        code: 'failure',
        message: 'validation error',
        error: error.details[0].message
      }) // bad request
    } else if (req.body.status === 'active') {
      return res.status(400).json({
        code: 'failure',
        message: `unable to facilitate the request to update all users to ${req.body.status}`
      }) // unable to facilitate the request
    } else {
      try {
          console.log('---------- inside the TRY of PATCH companies/:id/company-wide-status')
          // locate ALL employees of the company and change their status
          let updated_employees = [] // array for all updated employees
          const employees = await User.find({company_id: req.params.id}, { password: 0 })
          try {
            if (Object.size(employees) == 0) {
              console.log('there are no employees connected to this company')
            } else {
              // loop through the employees
              for (const key of  Object.keys(employees)) {
                console.log('found employee #', employees[key]._id)
                let employee_filter = employees[key]._id
                const employee_update = {
                  'status': req.body.status,
                  'status_date': moment()
                }
                const employee_options = {
                  fields: 'status status_date name email date phone.number',
                  useFindAndModify: false
                }
                let this_employee = await User.findByIdAndUpdate(employee_filter, employee_update, employee_options)
                if (this_employee) {
                  console.log(`updated employee ${ employee_filter } status to ${ employee_update.status } on ${ employee_update.status_date }`)
                  updated_employees.push(employees[key]._id) // append employee's id to the array
                } else {
                  console.log(`unable to update ${ employee_filter } to ${ employee_update.status } status`)
                }
              }
            }
          } catch (err) {
            console.log(err)
          }
          const filter = { _id: req.params.id }
          const update = { 
            'status': req.body.status,
            'status_date': moment() 
          } // create a way to inform the user of the status change
          const options = {
            new: true,
            useFindAndModify: false,
            fields: 'date role status status_date email phone.number'
          }
          // loop through the employees object and update each ones status
          let success_message
          if (updated_employees.length > 1) {
            success_message = `updated company and ${updated_employees.length} employees to ${req.body.status} status`
          } else if (updated_employees.length == 1) {
            success_message = `updated company and ${updated_employees.length} employee to ${req.body.status} status`
          } else { 
            success_message = `updated company to ${req.body.status} status`
          }
          let this_company = await Company.findOneAndUpdate(filter, update, options)
          if (this_company){ res.json({ 
            code: 'success',
            message: success_message,
            updated: this_company,
            updated_employees // include the updated employees array
          })
        } else { res.status(400).json({
          code: 'failure',
          message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err
        })
      }
    }
  })

module.exports = router