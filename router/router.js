const express = require('express')
const router = express.Router()
const User = require('../models/user.model');
const Projet = require('../models/projet.model');
const {
    registerUser,
    loginUser,
    getUser,
    sendForgetPasswordEmail,
    imagePofile,
    saveCv,
    contrat,
    ajoutProjet,
    getProjet,
    getPasswordLink,
    updatePassword,
    editUserPofile,
    getUserPofile,
    getIdProjet,
    countUsersByRole,
    userStat,
    updateProjet,
    ajouterAxe
} = require('../controllers/user.controller')
const auth = require('../middlewares/auth')
// const protect = require('../middlewares/auth.midd')
const { loginValidation } = require('../controllers/userValidation/login.Validation')
const { registerValidation, registerValidationProjet } = require('../controllers/userValidation/register.Validation')
const multer = require('multer');


let upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'upload')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + req.user.id + '-' + file.originalname)
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
            cb(null, Date.now() + req.user.id + '-' + file.originalname)
        }

    }),

    fileFilter: (req, file, cb) => {
        console.log(file);
        cb(null, true)
    }
})
let uploadcontrat = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'contrat')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname)
        }

    }),

    fileFilter: (req, file, cb) => {
        console.log(file);
        cb(null, true)
    }
})

router.get('/users/stats', userStat);
//register
router.post('/sign-up', registerValidation, registerUser)
router.post('/projet', registerValidationProjet, ajoutProjet)
router.post('/axeprojet', ajouterAxe)
//login
router.post('/sign-in', loginValidation, loginUser)
//get
router.get('/', auth, getUser)
//get profile
router.get('/profile', auth, getUserPofile)
//get projet
router.get('/projet', auth, getProjet)
router.get('/projets/:id', getIdProjet);

//modifier profile
router.put('/profile', auth, editUserPofile)
//modifier projet
router.put('/projet/modifier/:id', updateProjet)
//ajout file
router.post('/profile/avatar', auth, upload.single('myFile'), imagePofile)
router.post('/profile/cv', auth, uploadcv.single('cv'), saveCv)
router.post('/projet/contrat', uploadcontrat.single('contrat'), contrat)
// send email recovery
router.post('/reset-password', sendForgetPasswordEmail)
router.post('/')
router.get('/')
// get token
//router.get('/reset-password/:token', getPasswordLink)
// update password
router.put('/reset-password/:token', updatePassword)
module.exports = router

