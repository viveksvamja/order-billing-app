const express = require('express');
const auth = require('./../middlewares/auth')
const router = express.Router();
const multer = require('multer')

const UserController = require('./../controllers/users.controller');
const controller = new UserController();

router.post('/signup', (req, res) => controller.signup(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.post('/logout', auth ,(req, res) => controller.logout(req, res));

// Define multer and add validation rules to upload avatar images
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Invalid avatar. Please upload image files'))
        }
        cb(undefined, true)
    }
})

router.patch('/update', auth , upload.single('avatar'), (req, res) => controller.update(req, res));
router.get('/avatar', auth ,(req, res) => controller.getUserAvatar(req, res));
router.get('/user', auth ,(req, res) => controller.getUser(req, res));

module.exports = router;