const express = require('express');
const app = express();
const router = express.Router();
const { login, register } = require('../controller/authController');


router.post('/signup', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);


module.exports = router;