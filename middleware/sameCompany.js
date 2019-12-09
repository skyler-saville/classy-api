// check the req.params.id (user id) and make sure the company id matches the employees company id
const mongoose = require('mongoose')
const User = mongoose.model('User')


const sameCompany = async function (req, res, next) {
  
  const employee = await User.findById(req.params.id)
  console.log(`Confirming user, ${req.params.id}, is an employee of Company, ${req.user}`)
  try {
    if (employee._id == req.user._id) { // strict compare wasn't working as expected
      res.status(403).send({
        code: 'failure',
        message: 'You are not authorized to re-assign your own role',
        employee: employee._id,
        current_user_id: req.user._id
    })
    } else if (req.user.role === 'company') {
        if (employee.company_id == req.user._id) {
          next()
        }
    } else if ( req.user.role === 'admin' || req.user.role === 'owner') {
      const authUser = await User.findById(req.user._id)
      if (authUser.company_id === employee.company_id) {
        console.log(`'${authUser.name}' from '${authUser.company_name}' editing user role`)
        next()
      }
    } else {
    res.status(403).send({
        code: 'failure',
        message: 'Unauthorized attempt to edit foreign user',
        employee: employee._id,
        company_id: employee.company_id,
        company_name: employee.company_name,
        current_user_id: req.user._id
      })
    }
  } catch (err) {
    console.log("employee isn't affiliated with the commpany ", err)
  }
}

module.exports = {
  sameCompany
}