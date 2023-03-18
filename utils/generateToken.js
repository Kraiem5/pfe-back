const jwt = require('jsonwebtoken')

async function generateToken(payload) {

  return await jwt.sign(payload, process.env.JWT_reset_pass, { expiresIn: process.env.JWT_EXPIRES_IN })
}
async function verifToken(token) {
  try {
    return await jwt.verify(token, process.env.JWT_reset_pass, { expiresIn: process.env.JWT_EXPIRES_IN })

  } catch (error) {
    return false
  }
}

module.exports = { generateToken, verifToken }