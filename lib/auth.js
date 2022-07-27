var jwt = require('jsonwebtoken')

// generate object data to token
exports.sign = function (userInfo, expiresIn) {
  if (expiresIn == undefined) {
    expiresIn = config.token.expiresIn || 24 * 60 * 60
  }
  return jwt.sign(userInfo, config.token.phrase, { expiresIn: expiresIn })
}

// resolve token to object data
exports.verify = (token) => new Promise((resolve, reject) => {
  if (token) {
    jwt.verify(token, config.token.phrase, (err, decoded) => {
      if (err) {
        reject({ name: 'EXPIRED_TOKEN', message: 'Failed or expired token' })
      } else {
        resolve(decoded)
      }
    })
  } else {
    reject({ name: 'NO_TOKEN', message:'No token provided'})
  }
})