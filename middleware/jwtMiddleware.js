// middleware/jwtMiddleware.js
const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header.' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: [process.env.JWT_ALGORITHM] },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' })
      }
      // Attach decoded token payload to request (if needed)
      req.user = decoded
      next()
    }
  )
}

module.exports = jwtMiddleware
