/**
 * Authorization Groups
 */
const { 
  All_Roles, Low_Roles, Mid_Roles, 
  High_Roles, Company_Roles, Admin_Roles, 
  Office_Roles, Shop_Roles, 
  Installer_Roles, Customer_Roles }  = require('./Roles')

const very_low = Object.values(All_Roles)
const low = Object.values(Low_Roles)
const medium = Object.values(Mid_Roles)
const high = Object.values(High_Roles)
const very_high = Object.values(Company_Roles)
const admin_only = Object.values(Admin_Roles)
const officeStaff = Object.values(Office_Roles)
const shopStaff = Object.values(Shop_Roles)
const installerStaff = Object.values(Installer_Roles)
const customer = Object.values(Customer_Roles)

/**
 *  Limit Access based on User Role
 */
// PROTECT SELF ROUTES (currently logged in ADMIN, COMPANY, or USER ONLY) for stuff like password changes, etc.
const isSelf = function (req, res, next){
  if (req.user._id !== req.params.id) {
    console.log("Unauthorized User", req.user._id)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
  next()
}
// Current user or Admin
const isSelf_orAdmin = function (req, res, next){
  if (req.user._id === req.params.id || admin_only.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// Includes ADMIN access, by Default
const isSelf_orCompany = function (req, res, next){
  console.log('isSelf_orCompany params=',req.params)
  console.log('isSelf_orCompany req.user.id=', req.user)
  if (req.user._id === req.params.id || very_high.includes(req.user.role)) {
    console.log('req.params = ', req.params)
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// Include ADMIN & COMPANY
const isSelf_orOwner = function (req, res, next){
  if (req.user._id === req.params.id || high.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// Is customer of High Roles
const isSelf_andCustomer = function (req, res, next){
  if (req.user._id === req.params.id && customer.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// PROTECT ADMIN ONLY ROUTES
const isAdmin = function (req, res, next){
  if (req.user.role !== 'admin') {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('user is Admin')
  next ()
}

const isCompany = function (req, res, next){
  if (req.user.role !== 'company') {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('user is Company')
  next ()
}
const isOwner = function (req, res, next){
  if (req.user.role !== 'owner') {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log('user is Company Owner')
  next ()
}

/**
 * Limit Access based on User's Group
 */
// All_Roles (Admin -> Basic)
const VeryLow = function (req, res, next){
  if (!very_low.includes(req.user.role)) {
    console.log('user role=',req.user.role)
    console.log('very_low roles include ', very_low)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in Very-Low Authorization Group')
  next ()
}
// Low_Roles (Admin -> Installer.Basic)
const Low = function (req, res, next){
  if (!low.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in Low Authorization Group')
  next ()
}
// Mid_Roles (Admin -> Installer.Mod)
const Medium = function (req, res, next){
  if (!medium.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in Medium Authorization Group')
  next ()
}
// High_Roles (Admin -> Installer.Admin)
const High = function (req, res, next){
  if (!high.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in High Authorization Group')
  next ()
}
// Company_Roles (Admin -> Owner)
const VeryHigh = function (req, res, next){
  if (!very_high.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in Very-High Authorization Group')
  next ()
} 
// Admin_Roles (Admin ONLY)
const AdminOnly = function (req, res, next){
  if (!admin_only.includes(req.user.role)) {
    console.log(req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Authorization Too Low" })
  } 
  console.log("Authorized User", req.user._id, req.user.role)
  console.log('User in Admin-Only Authorization Group')
  next ()
}

/**
 * Staff-Group Based
 */
// Office
// Include ADMIN & COMPANY
const isOffice = function (req, res, next){
  if (officeStaff.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// Shop
const isShop = function (req, res, next){
  if (shopStaff.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
// Installers
const isInstaller = function (req, res, next){
  if (installerStaff.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}
/**
 * Etc Groups
 */
// Customer Group
const isCustomer = function (req, res, next){
  if (customers.includes(req.user.role)) {
    next()
  } else {
    console.log("Unauthorized User", req.user._id, req.user.role)
    return res.status(403).send({ code: 'failure', message: 'Access Denied', reason: "Incorrect User Creditials" })
  }
}


module.exports = {
  // Self
  isSelf,
  isSelf_orAdmin,
  isSelf_orCompany,
  isSelf_orOwner,

  // Users
  admin: isAdmin,
  company: isCompany,
  owner: isOwner,

  // Auth-Level Based Groups
  VeryLow,
  Low,        // Admin -> Installer.Basic
  Medium,     // Admin -> Installer.Mod
  High,       // Admin -> Installer.Admin
  VeryHigh,   // Admin -> Owner
  AdminOnly,  // Admin

  // Customer-Based Groups
  isSelf_andCustomer, // for non-Get operations on customer
  isCustomer,         // for GET requests only coming from customer account

  // Staff-Based Groups
  isOffice,           // Office.Admin -> Office.Basic
  isShop,             // Shop.Admin -> Shop.Basic
  isInstaller         // Installer.Admin -> Installer.Basic
}