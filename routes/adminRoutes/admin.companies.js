const router = require('express').Router()
const mongoose = require('mongoose')
const Company = mongoose.model('Company')
const verify = require('../../middleware/verifyToken')
const { admin } = require('../../middleware/permissions')

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
// get a list of specific users
router.route('/search')                   // api/users/search
  .get( verify, admin, async (req, res) => {
    if (!req.query) {
      res.status(404).json({
        code: 'failure',
        message: 'unable to locate a query in the URL'
      })
    } else if (req.query.status === 'status') {
      console.log(`query for ${req.query.status}`)
    } else if (req.query.status === 'pending') {
      console.log(`query for ${req.query.status}`)
    } else if (req.query.status === 'active') {
      console.log(`query for ${req.query.status}`)
    } else if (req.query.status === 'disabled') {
      console.log(`query for ${req.query.status}`)
    } else if (req.query.status === 'deleted') {
      console.log(`query for ${req.query.status}`)
    } else if (req.query.before_date) {
      console.log(`query for ${req.query}`)
    } else if (req.query.after_date) {
      console.log(`query for ${req.query}`)
    } else if (req.query.company_id) {
      console.log(`query for ${req.query}`)
    } else if (req.query.first_name) {
      console.log(`query for ${req.query}`)
    } else if (req.query.last_name) {
      console.log(`query for ${req.query}`)
    } else if (req.query.exact_name) {
      console.log(`query for ${req.query}`)
    } else if (req.query.role) {
      console.log(`query for ${req.query}`)
    } else if (req.query.phone_number) {
      console.log(`query for ${req.query}`)
    } else {
      // catch ALL 
      res.status(400).json({
        code: 'failure',
        message: 'unable to find any correctly structured query in URL'
      })
    }
  })
// get a single company by id
router.route('/:id')                   // api/users/:id
  .get( verify, admin, async (req, res) => {
    res.send('you have reached the GET /companies/:id router')
  })
// update a single user info
  .patch( verify, admin, async (req, res) => {
    res.send('you have reached the PATCH /companies/:id router')
  })
// delete a single user
  .delete( verify, admin, async (req, res) => {
    res.send('you have reached the DELETE /companies/:id router')
  })
// soft-delete a company... set their account to inactive and prevent them or thier employees from logging in
  .put( verify, admin, async (req, res) => {
     res.send('you have reached the PUT /companies/:id router') 
  })
module.exports = router