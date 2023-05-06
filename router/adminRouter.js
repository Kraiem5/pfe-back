const express = require('express')
const router = express.Router()
const User = require('../models/user.model');
const { Role } = require('../models/role.model');
const { validationResult } = require('express-validator');

router.post('/new', async (req, res) => {
    try {
        const { name, description } = req.body;
        const role = new Role({ name, description });
        await role.save();
        res.status(201).json({ message: 'Rôle ajouté avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du rôle' });
    }
});
router.get('/role/all', async (req, res) => {
    try {
        const role = await Role.find()

        return res.json(role)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
    }
})
router.put('/role/modifier/:id', async (req, res) => {
    try {
        const result = await Role.findByIdAndUpdate(req.params.id, { $set: req.body })

        res.status(200).json({ message: 'Rôle modifié avec succès', data: result });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Erreur lors de la modification du rôle' });
    }
});
router.delete('/role/delete/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }
        res.status(200).json({ message: 'Rôle supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du rôle' });
    }
});
router.post('/sign-up', async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const { nom, prenom, email, password, role, cin } = req.body
    try {
        // email existe
        let user = await User.findOne({ email: email })
        if (user) {
            return res.status(403).json({ msg: "utilisateur déja existe" })
        }
        else {
            // else define new user
            const newUser = new User({
                nom, prenom, email, password, role, cin
            })
            // save new user
            await newUser.save()

            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.error('erreur', error)
        res.status(400).send({ status: false })

    }
})
router.delete('/deleteUser/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User non trouvé' });
        }
        res.status(200).json({ message: 'User supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du rôle' });
    }
});
router.put('/modifierUser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            const result = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
                .select('-password');
            res.json({
                status: true,
                result: result
            });
        } else {
            res.status(400).json({
                success: false,
                msg: 'User not found'
            });
        }
    } catch (error) {
        console.log('Update user', error);
    }
});


module.exports = router