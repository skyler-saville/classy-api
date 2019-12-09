const mongoose = require('mongoose')
const flatten = require('flat')
const carriers_json = require('../data_sources/mobile_carriers.json')
const Company = mongoose.model('Company')
const carriers = []
const carrier_gateways = []
const Roles = flatten(Object.freeze({  // flatten Object to single level ( i.e. Office: {Admin: "admin"} becomes "Office.Admin": "admin" ) to allow enum to work
  Admin: 'admin',
  Company: 'company',
  Owner: 'owner',
  Office: {
    Admin: 'office.admin',
    Mod: 'office.mod',
    Basic: 'office.basic'
  },
  Shop: {
    Admin: 'shop.admin',
    Mod: 'shop.mod',
    Basic: 'shop.basic' 
  },
  Installer: {
    Admin: 'installer.admin',
    Mod: 'installer.mod',
    Basic: 'installer.basic'
  },
  Basic: 'basic',
  Customer: 'customer'
}))

function appendGateways (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carrier_gateways.push(us_carriers[i][1])
    // console.log('appending to carriers_gateways array in Users model ', us_carriers[i][0])
  }
  //console.log('running the Gateways function')
  carrier_gateways.push('N/A')
  //console.log(carrier_gateways[0])
  return carrier_gateways
}

function appendCarriers (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carriers.push(us_carriers[i][0])
    // console.log('appending to carriers array in Users model ', us_carriers[i][0])
  }
  //console.log('running the appendCarriers function')
  carriers.push('N/A') // append 'N/A' to list of carriers
  //console.log(carriers[0])
  return carriers
}

function addNumberToGateway (userCarrier, userNumber, carriers, carrier_gateways) {
  if (carriers.length == carrier_gateways.length) {
    for (i in carriers) {
      if (userCarrier == carriers[i]) {
        const this_gateway = carrier_gateways[i]
        if (this_gateway !== "N/A"){
          console.log('this_gateway !== "N/A"')
          const users_gateway = this_gateway.replace("{number}", userNumber)
          console.log("users_gateway from addNumberToGateway function", users_gateway)
          return users_gateway
        }
      }
    }
  }
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true, 
    max: 255,
    min: 6
  },
  email: { // this needs to be unique... but Joi may be able to handle that.
    type: String,
    require: true,
    max: 255,
    min: 6
  },
  password: { // password hashed before saving
    type: String,
    require: true,
    max: 1024,
    min: 6
  },
  phone: {
    number: {
      type: String,
      min: 10 // number only, no other chars allowed
    },
    carrier: {
      type: String,
      enum: appendCarriers(carriers_json),
    },
    carrier_gateway: {
      type: String,
      enum: appendGateways(carriers_json)
    }
  },
  date: { // sign up date
    type: Date,
    default: Date.now
  }, // adding to user schema to create User authorization
  role: {
    type: String,
    // enum: ['basic','moderate', 'advanced', 'owner', 'admin' ],
    enum: Object.values(Roles),
    default: Roles.Basic
  },
  company_id: { // this will help to grant the company owner(s) similar administrative abilities as being logged in as the company profile (in case of multiple owners)
    type: mongoose.Schema.Types.ObjectId,
    ref: Company
  },
  company_name: {
    type: String
  },
  status: {
    type: String, 
    enum: ['pending', 'active', 'disabled'],
    default: 'pending' // will change to active when email is confirmed
  }
})

userSchema.pre('save', function (next) {
  if (this.phone.number && this.phone.carrier) {
    // replace {number} with this.phone.number on the gateway value and set phone.carrier_gateway to this new string
    // create a function for it
    const userCarrier = this.phone.carrier
    const userNumber = this.phone.number
    this.phone.carrier_gateway = addNumberToGateway(userCarrier, userNumber, carriers, carrier_gateways)
  }
  console.log('running pre-save')
  next()
})

// userSchema.pre('findOneAndUpdate', function (next) {
//   this._update.$set.phone.carrier_gateway = 'null'
//   console.log('-------------------------->>>>>>> post findOneAndUpdate: ', this)
//   if (this._update.phone.number && this._update.phone.carrier) {
//     console.log(this._update.phone.number)
//     replace {number} with this.phone.number on the gateway value and set phone.carrier_gateway to this new string
//     create a function for it
//     const userCarrier = this.phone.carrier
//     const userNumber = this.phone.number
//     this.phone.carrier_gateway = addNumberToGateway(userCarrier, userNumber, carriers, carrier_gateways)
//   }
//   console.log('running pre-save')
//   next()
// })


module.exports = mongoose.model('User', userSchema)