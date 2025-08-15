require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');

const app = express();
const PORT = process.env.PORT || 3002;
 mongoose.connect(process.env.MONGODB_URI).then(() => {
  logger.info('Connected to MongoDB');
}).catch(err => {
  logger.error('MongoDB connection error:', err);
});

const redisClient = new redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());  
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} from ${req.url}`)
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

//Ip based rate limiting for sensitive endpoints
//1.ratelimiter for create posts endpoint
const ceatePostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Create posts endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//2.ratelimiter for get posts endpoint
const getPostsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Get post endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//apply this sensitiveEndpointsLimiter to our routes
app.use("/api/posts/create-post/", ceatePostLimiter);
app.use("/api/posts/single-post||all-posts", getPostsLimiter);

//Routes
app.use('/api/posts', (req,res,next)=>{
  req.redisClient = redisClient;
  next();
}, postRoutes);

//Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Post service running on port ${PORT}`);
});

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});