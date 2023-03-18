const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getUser, sendForgetPasswordEmail, 
    imagePofile,saveCv,
    getPasswordLink, updatePassword, editUserPofile, getUserPofile } = require('../controllers/user.controller')
const auth = require('../middlewares/auth')
// const protect = require('../middlewares/auth.midd')
const { loginValidation } = require('../controllers/userValidation/login.Validation')
const { registerValidation } = require('../controllers/userValidation/register.Validation')
const multer = require('multer');


let upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'upload')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() +req.user.id+ '-' + file.originalname)
        }

    }),
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        console.log(file);
        cb(null, true)
    }
})
let uploadcv = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'cv')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() +req.user.id+ '-' + file.originalname)
        }

    }),
    
    fileFilter: (req, file, cb) => {
        console.log(file);
        cb(null, true)
    }
})
//register
router.post('/sign-up', registerValidation, registerUser)
//login
router.post('/sign-in', loginValidation, loginUser)
//get
router.get('/', auth, getUser)
//get profile
router.get('/profile', auth, getUserPofile)
//modifier profile
router.put('/profile', auth, editUserPofile)
router.post('/profile/avatar', auth,upload.single('myFile'), imagePofile)
router.post('/profile/cv', auth,uploadcv.single('cv'), saveCv)
// send email recovery
router.post('/reset-password', sendForgetPasswordEmail)
router.post('/')
router.get('/')
// get token
//router.get('/reset-password/:token', getPasswordLink)
// update password
router.put('/reset-password/:token', updatePassword)
module.exports = router

