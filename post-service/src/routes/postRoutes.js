const express = require('express');
const {createPost, getPost, getAllPost, deletePost} = require('../controllers/postController');
const {authenticatedRequest} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticatedRequest);

router.post('/create-post', createPost);
router.get('/single-post/:id', getPost);
router.get('/all-posts', getAllPost);
router.delete('/delete-post/:id', deletePost);

module.exports = router;


