const express = require('express');
const {createPost, getPost, getAllPost, deletePost} = require('../controllers/postController');
const {authenticatedRequest} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticatedRequest);

router.post('/create-post', createPost);
router.get('/single', getPost);
router.get('/all', getAllPost);

module.exports = router;


