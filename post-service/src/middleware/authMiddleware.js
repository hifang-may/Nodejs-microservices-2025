const logger = require('../utils/logger');

const authenticatedRequest = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    logger.error('User ID not provided in request headers');
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  } 
  req.user = { userId };
  next();

};

module.exports = {authenticatedRequest};