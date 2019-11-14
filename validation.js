// Validation
const Joi = require('@hapi/joi')

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
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


module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation


  // // Validate data before making a new user
  // const { error } = schema.validate(req.body)
  // // error.details[0].message
  // if (error) return res.status(400).send(error.details[0].message) // bad request
