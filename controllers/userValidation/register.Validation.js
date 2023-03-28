const { check } = require("express-validator");

const registerValidation = [
    check('nom').not().isEmpty().withMessage('nom obligataoire'),
    check('prenom').not().isEmpty().withMessage('prenom obligataoire'),
    check('email').not().isEmpty().withMessage('amail obligataoire').isEmail().withMessage('faux email'),
    check('password').not().isEmpty().withMessage('pass obligataoire').isLength({ min: 8 }).withMessage('minimum 8 caractere'),
    check('role').not().isEmpty().withMessage('role obligataoire'),
    check('cin').not().isEmpty().withMessage('cin obligataoire'),
]
const registerValidationProjet = [
    check('nom_projet').not().isEmpty().withMessage('nom_projet obligataoire'),
    check('client').not().isEmpty().withMessage('client obligataoire'),
    check('description').not().isEmpty().withMessage('description obligataoire'),
    check('begin').not().isEmpty().withMessage('begin obligataoire').isDate(),
    check('end').not().isEmpty().withMessage('end obligataoire').isDate(),
    check('user').not().isEmpty().withMessage('user obligataoire'),
    check('code_postal').not().isEmpty().withMessage('code_postal obligataoire'),
    check('contrat').not().isEmpty().withMessage('contrat obligataoire'),
]

module.exports = { registerValidation, registerValidationProjet }