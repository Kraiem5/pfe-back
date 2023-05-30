const express = require('express')
const router = express.Router()
const User = require('../models/user.model');
const Projet = require('../models/projet.model');
const {
    registerUser,
    loginUser,
    modifierPasswordApresConnexion,
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
    calculateUserStatistics,
    updateProjet,
    deleteProjet,
    deleteAxe,
    ajouterAxe,
    searchProjet,
    ajouterTache,
    deleteTache,
    getAxes,
    updateTache,
    updateAxe,
    calculateTaskPercentages,
    getMyDoc,
    newDoc,
    newFile
} = require('../controllers/user.controller')
const auth = require('../middlewares/auth')
// const protect = require('../middlewares/auth.midd')
const { loginValidation } = require('../controllers/userValidation/login.Validation')
const { registerValidation, registerValidationProjet } = require('../controllers/userValidation/register.Validation')
const multer = require('multer');
const bcrypt = require('bcryptjs')


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
        fileSize: 10000000
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
let upDocuments = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'documents')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + req.user.id + '-' + file.originalname)
        }

    }),
    limits: {
        fileSize: 10000000
    },
    fileFilter: (req, file, cb) => {
        console.log(file);
        cb(null, true)
    }
})
//register
router.post('/sign-up', registerValidation, registerUser)
router.post('/projet', registerValidationProjet, ajoutProjet)
router.post('/axeprojet', ajouterAxe)
router.post('/:id/tacheprojet', ajouterTache)
//login
router.post('/sign-in', loginValidation, loginUser)
//get
router.get('/', getUser)
//get profile
router.get('/profile', auth, getUserPofile)
//document
router.get('/document/:parentId', auth, getMyDoc)
router.post('/document/new/:parentId', auth, newDoc)
router.post('/document/newFile', auth, upDocuments.single('myFile'), newFile)
//get projet
router.get('/projet', getProjet)
router.get('/projet/:id', getIdProjet);
router.post('/search', async (req, res) => {
    try {
        const projet = await searchProjet(req.body.searchTerm);
        if (projet) {
            res.json(projet);
        } else {
            res.status(400).json({ message: 'Élément non trouvé' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.delete('/projet/delete/:id', deleteProjet)
router.delete('/projet/:projetId/axe/:axeId', deleteAxe)
router.delete('/projet/:projetId/axe/:axeId/tache/:tacheId', deleteTache)

router.get('/projects/calculate-task-percentages', calculateTaskPercentages);
router.get('/statistics', calculateUserStatistics);

router.get('/axes', getAxes);
//router.get('/:projetId/axes', getAxes);



//modifier profile
router.put('/profile', auth, editUserPofile)
//modifier projet
router.put('/projet/modifier/:id', updateProjet)
router.put('/tache/:idProjet', updateTache)
router.put('/projet/:idProjet/axe/:idAxe', updateAxe)
//ajout file
router.post('/profile/avatar', auth, upload.single('myFile'), imagePofile)
router.post('/profile/cv', auth, uploadcv.single('cv'), saveCv)
router.post('/projet/contrat', uploadcontrat.single('contrat'), contrat)
// send email recovery
router.post('/reset-password', sendForgetPasswordEmail)
router.post('/')
router.get('/')
router.put('/modifierMotDePasse', auth, modifierPasswordApresConnexion)


// get token
//router.get('/reset-password/:token', getPasswordLink)
// update password
router.put('/reset-password/:token', updatePassword)
module.exports = router

