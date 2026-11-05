const express = require('express');
const ctrl = require('../controllers/contentController');

// Public site copy, info pages and the blog
const router = express.Router();

router.get('/content',              ctrl.getSiteContent);
router.get('/pages/:slug',          ctrl.getPage);
router.get('/blog/posts',           ctrl.listPosts);
router.get('/blog/posts/:slug',     ctrl.getPost);
router.get('/blog/categories',      ctrl.listCategories);
router.get('/blog/tags',            ctrl.listTags);

module.exports = router;
