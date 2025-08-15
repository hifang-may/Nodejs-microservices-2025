const Post = require('../models/post');
const logger = require('../utils/logger');

const createPost = async (req, res) => {
  try {
    logger.info('create post endpoint hit');
    const { content, mediaIds } = req.body;
   const newlyCreatedPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || Date.now().toString(),  
    });
    logger.info('Post created successfully', newlyCreatedPost); 
    res.status(201).json({ 
      success: true,
      message: 'Post created successfully',
      post: newlyCreatedPost 
    });

  } catch (error) {
    logger.error('Error creating post', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' });
  }
}

const getPost = async (req, res) => {
  try {
    
  } catch (error) {
    logger.error('Error fetching post', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' });
  }
}

const getAllPost = async (req, res) => {
  try {
    
  } catch (error) {
    logger.error('Error fetching all post', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' });
  }
}

const deletePost = async (req, res) => {
  try {
    
  } catch (error) {
    logger.error('Error deleting post', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' });
  }
}

module.exports = {
  createPost, getPost, getAllPost, deletePost}