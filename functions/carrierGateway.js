const carriers_json = require('../data_sources/mobile_carriers.json')
let carriers = []
let carrier_gateways = []

const appendGateways = (carriers_json) => {
  carrier_gateways = [] // pre-clear the array
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carrier_gateways.push(us_carriers[i][1])
    // console.log('appending to carriers_gateways array in Users model ', us_carriers[i][0])
  }
  // console.log('------------------>>>>>>>>>>> running the Gateways function')
  carrier_gateways.push('N/A')
  // console.log(carrier_gateways[0])
  return carrier_gateways
}

const appendCarriers = (carriers_json) => {
  carriers = [] // pre-clear the array
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carriers.push(us_carriers[i][0])
    // console.log('appending to carriers array in Users model ', us_carriers[i][0])
  }
  // console.log('------------------>>>>>>>>>>> running the appendCarriers function')
  carriers.push('N/A')
  // console.log(carriers[0])
  return carriers
}

const addNumberToGateway = (userCarrier, userNumber, carriers, carrier_gateways) => {
  if (carriers.length == carrier_gateways.length) {
    for (i in carriers) {
      if (userCarrier == carriers[i]) {
        const this_gateway = carrier_gateways[i]
        if (this_gateway !== "N/A"){
          // console.log('this_gateway !== "N/A"')
          const users_gateway = this_gateway.replace("{number}", userNumber)
          // console.log('-------------------->>>>>>>> running the addNumberToGateway function')
          // console.log("users_gateway from addNumberToGateway function", users_gateway)
          return users_gateway
        }
      }
    }
  }
}

module.exports.addNumberToGateway = addNumberToGateway
module.exports.appendCarriers = appendCarriers
module.exports.appendGateways = appendGateways
module.exports.carriers = carriers
module.exports.carrier_gateways = carrier_gateways