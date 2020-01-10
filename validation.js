// Validation
const Joi = require('@hapi/joi')

const nameOnlyValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(30).required()
  })
  return schema.validate(data)
}

const statusOnlyValidation = (data) => {
  const schema = Joi.object({
    status: Joi.any().valid('pending', 'active', 'disabled', 'deleted')
  })
  return schema.validate(data)
}

const companyRegisterValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().regex(/^\d{10}$/) // formats required is 5555555555 (client-side validation required)
  })
  return schema.validate(data)
}


const userRegisterValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    phone: {
      number: Joi.string().trim().regex(/^[0-9]{10}$/), // formats required is 5555555555 (client-side validation required)
      carrier: Joi.string().max(30)
    },
    job_title: Joi.string().max(45)
  })
  return schema.validate(data)
}

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .required()
  })
  return schema.validate(data)
}

// used for validating PATCH updates on Users and Companies
const phoneValidate = (data) => {
  const schema = Joi.object({
    phone: {
      number: Joi.string().trim().regex(/^[0-9]{10}$/), // formats required is 5555555555 (client-side validation required)
      carrier: Joi.string().max(25)
    }
  })
  return schema.validate(data)
}


module.exports.companyRegisterValidation = companyRegisterValidation
module.exports.userRegisterValidation = userRegisterValidation
module.exports.loginValidation = loginValidation
module.exports.phoneValidate = phoneValidate
module.exports.nameOnlyValidation = nameOnlyValidation
module.exports.statusOnlyValidation = statusOnlyValidation



  // // Validate data before making a new user
  // const { error } = schema.validate(req.body)
  // // error.details[0].message
  // if (error) return res.status(400).send(error.details[0].message) // bad request
