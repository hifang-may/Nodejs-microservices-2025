const Post = require("../models/post");
const { validateCreatePost } = require("../routes/validation");
const logger = require("../utils/logger");

async function invalidatePostCache(req, input) {
  const cacheKey = `post:${input}`;
  await req.redisClient.del(cacheKey);
  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
    logger.info("Post cache invalidated");
  }
}

const createPost = async (req, res) => {
  logger.info("create post endpoint hit");
  try {
    //validate the schema
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || Date.now().toString(),
    });
    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newlyCreatedPost,
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPost = async (req, res) => {
  logger.info("get post endpoint hit");
  try {
    const postId = req.params.id;
    if (!postId) {
      logger.warn("Post ID is required");
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);
    if (cachedPost) {
      logger.info("Post fetched from cache");
      return res.status(200).json({
        success: true,
        post: JSON.parse(cachedPost),
      });
    }

    const postDetails = await Post.findById(postId)
    if (!postDetails) {
      logger.warn("Post not found");
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(postDetails));
    logger.info("Post fetched successfully");
    res.status(200).json({
      success: true,
      post: postDetails,
    });
  } catch (error) {
    logger.error("Error fetching post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllPost = async (req, res) => {
  logger.info("get all posts endpoint hit");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      logger.info("Posts fetched from cache");
      return res.status(200).json({
        success: true,
        posts: JSON.parse(cachedPost),
      });
    } else {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      if (posts.length === 0) {
        logger.info("No posts found");
        return res.status(404).json({
          success: false,
          message: "No posts found",
        });
      }

      const totalPosts = await Post.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);

      const result = {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
      };

      // Cache the posts
      await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

      logger.info("Posts fetched successfully");
      res.status(200).json({
        success: true,
        result,
      });
    }
  } catch (error) {
    logger.error("Error fetching all post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deletePost = async (req, res) => {
  logger.info("delete post endpoint hit");
  try {
    const deletePost = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    await invalidatePostCache(req, req.params.id);

    logger.info("Post deleted successfully");
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post: deletePost,
    });
  } catch (error) {
    logger.error("Error deleting post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createPost,
  getPost,
  getAllPost,
  deletePost,
};
