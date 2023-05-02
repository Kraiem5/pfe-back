const express = require('express')
const router = express.Router()
const User = require('../models/user.model');
const { Role } = require('../models/role.model');

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
router.get('/all', async (req, res) => {
    try {
        const role = await Role.find()
        console.log(role);
        return res.json(role)
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
    }
})
router.put('/modifier/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id)
        if (role) {
            role.name = req.body.name;
            role.description = req.body.description;
            const result = await role.save();
            res.status(200).json({ message: 'Rôle modifié avec succès', data: result });
        } else {
            res.status(404).json({ message: 'Rôle non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la modification du rôle' });
    }
});
router.delete('/delete/:id', async (req, res) => {
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


module.exports = router