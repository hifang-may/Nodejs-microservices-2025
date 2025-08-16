const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");


const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
    return res.status(401).json({ success: false, 
      message: 'Unauthorized' });
  }
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token access attempt from IP: ${req.ip}`);
      return res.status(429).json({ success: false, message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  validateToken,}