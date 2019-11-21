/**
 * Authorization Groups
 */
const very_low = ['basic', 'moderate', 'advanced', 'owner', 'company', 'admin']
const low = ['moderate', 'advanced', 'owner', 'company', 'admin']
const medium = ['advanced', 'owner', 'company', 'admin']
const high = ['owner', 'company', 'admin']
const very_high = ['company', 'admin']
const admin_only = ['admin']

const isAdmin = function (req, res, next){
  if (req.user.role !== 'admin') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Admin')
  next ()
}

const isCompany = function (req, res, next){
  if (req.user.role !== 'company') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Company')
  next ()
}
const isOwner = function (req, res, next){
  if (req.user.role !== 'owner') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Company Owner')
  next ()
}
const isAdvanced = function (req, res, next){
  if (req.user.role !== 'advanced') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Advanced')
  next ()
}
const isModerate = function (req, res, next){
  if (req.user.role !== 'moderate') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Moderate')
  next ()
}
const isBasic = function (req, res, next){
  if (req.user.role !== 'basic') {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied' })
  } 
  console.log('user is Basic')
  next ()
}

const VeryLow = function (req, res, next){
  if (!very_low.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in Very-Low Authorization Group')
  next ()
}

const Low = function (req, res, next){
  if (!low.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in Low Authorization Group')
  next ()
}

const Medium = function (req, res, next){
  if (!medium.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in Medium Authorization Group')
  next ()
}

const High = function (req, res, next){
  if (!high.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in High Authorization Group')
  next ()
}

const VeryHigh = function (req, res, next){
  if (!very_high.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in Very-High Authorization Group')
  next ()
}

const AdminOnly = function (req, res, next){
  if (!admin_only.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('User in Admin-Only Authorization Group')
  next ()
}

module.exports = {
  // Users
  admin: isAdmin,
  company: isCompany,
  owner: isOwner,
  advanced: isAdvanced,
  moderate: isModerate,
  basic: isBasic,
  // Groups
  VeryLow,
  Low,
  Medium,
  High,
  VeryHigh,
  AdminOnly
}