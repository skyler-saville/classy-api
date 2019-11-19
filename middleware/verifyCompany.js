module.exports = function (req, res, next){
  
  if (req.user.role !== 'company') {
    console.log(req.user.role)
    return res.status(401).send('Access Denied')
  } 
  console.log('user is Company')
  next ()
}