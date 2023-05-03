const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model');
const Projet = require('../models/projet.model');
const mongoose = require('mongoose');
const { generateToken, verifToken } = require('../utils/generateToken');
require("dotenv").config();
const mailer = require('../utils/sendPasswordRecoveryMail');
const { config } = require('dotenv');
const multer = require('multer');
const { ObjectId } = require('mongodb');



const registerUser = async (req, res) => {

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
            return res.json({ msg: "utilisateur déja existe" })
        }
        else {
            // else define new user
            const newUser = new User({
                nom, prenom, email, password, role, cin
            })
            // save new user
            await newUser.save()
            // implement jwt

            // const payload ={
            //     user :{
            //         id: user.id
            //     }
            // }
            // jwt.sign(payload , "feefefefefe", {expiresIn : 7200000},(error , token)=>{
            //     if (error) throw error
            //     res.json({token})
            // })
            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.error('erreur', error)
        res.status(400).send({ status: false })

    }
}
const loginUser = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const { email, password } = req.body
    try {
        const user = await User.findOne({ email }).populate('role')
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: 'Cannot find user with those credentials!' }]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: 'Cannot find user with those credentials!' }]
            })
        }

        const payload = {
            user: {
                id: user._id,
                role: user.role.name
            }
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }, (error, token) => {
            if (error) throw error
            res.json({ token: token, admin: user.role.name === "Admin" ? true : false })
        })

    } catch (error) {
        console.error('fff', error.message)
        res.json({ msg: 'Erreur de serveur!' })
    }
}
const getUser = async (req, res) => {
    try {
        const user = await User.find(req.user)
        console.log(user);
        res.json(user)
    } catch (error) {
        console.error('fff', error.message)
        res.json({ msg: 'Erreur de serveur!' })
    }
}
const sendForgetPasswordEmail = async (req, res) => {
    const email = req.body['email']
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: 'Cannot find user with those credentials!' }]
            })
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        const token = generateToken(payload)
        mailer.send("resetCode", req.body['email'], "reset your password", token);
        res.status(200).json({ msg: 'Email sent!' })
    } catch (error) {
        console.error('fff', error.message)
        res.json({ msg: 'Erreuur de serveur!' })
    }
}
const updatePassword = async (req, res) => {
    try {
        const verif = await verifToken(req.params.token)
        if (!verif) {
            return res.status(400).json({
                status: false, message: 'Invalid Token !'
            })
        }
        const user = await User.findOne({ _id: verif.user.id })
        if (!user) {
            return res.status(400).json({
                status: false, message: 'Cannot find user with those credentials!'
            })
        }
        const salt = await bcrypt.genSalt(12)
        const newpassword = await bcrypt.hash(req.body.password, salt)
        const result = await User.findByIdAndUpdate(verif.user.id, { $set: { password: newpassword } })
            .select('-password')
        console.log(result)
        res.send({ status: true, message: 'passorw updated successfully' })
    } catch (error) {
        console.log(error)
    }
}
//***********get user */
const editUserPofile = async (req, res) => {
    try {
        console.log(req.user, req.body)
        const user = await User.findById(req.user.id);
        // const { cin, specialite } = req.body
        // const cv = req.file.cv || ''
        // const image = req.file.image || gravatar.url(email, { s: '200', r: 'pg', d: '404' })
        if (user) {
            const result = await User.findByIdAndUpdate(req.user.id, { $set: req.body })
                .select('-password')
            res.json({
                status: true,
                result: result
            })
        } else {
            res.status(404).json({
                succes: false,
                msg: 'user not found'
            })
        }
    } catch (error) {
        console.log("update profile", error)
    }
}
const getUserPofile = async (req, res) => {
    try {
        console.log(req.user, req.body)
        const user = await User.findById(req.user.id);
        if (user) {
            return res.json({
                status: true,
                result: user
            })
        }
        else {
            res.status(404).send({
                status: false,
                msg: 'user not found'
            })
        }
    } catch (error) {
        console.log("update profile", error)
    }
}
const getProjet = async (req, res) => {
    try {

        const projet = await Projet.find(req.projet);
        console.log('projet', projet)
        if (projet) {
            return res.json({
                status: true,
                result: projet
            })
        }
        else {
            res.status(404).send({
                status: false,
                msg: 'projet not found'
            })
        }


    } catch (error) {
        console.log("get projet", error)
    }
}
const getIdProjet = async (req, res) => {
    try {
        const projet = await Projet.findOne({ _id: req.params.id });
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        return res.json({
            status: true,
            result: projet,
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
}
const updateProjet = async (req, res) => {
    try {
        const projet = await Projet.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    nom_projet: req.body.nom_projet,
                    client: req.body.client,
                    description: req.body.description,
                    short_description: req.body.short_description,
                    begin: req.body.begin,
                    end: req.body.end,
                    user: req.body.user,
                    code_postal: req.body.code_postal,
                    contrat: req.body.contrat,

                }
            },
            { new: true }
        );
        if (!projet) {
            return res.status(404).json({ status: false, message: 'Projet non trouvé' });
        }
        return res.json({ status: true, data: projet });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
}
const updateTache = async (req, res) => {
    try {
        const { name, timeslot, pourcentage } = req.body;
        const projet = await Projet.findOne({ _id: req.params.idProjet });
        console.log("projet", projet);
        const tache = await Projet.findOneAndUpdate(

            { "axes.tache._id": req.params.idTache },
            {
                $set: {
                    "axes.$[i].tache.$[j].name": name,
                    "axes.$[i].tache.$[j].timeslot": timeslot,
                    "axes.$[i].tache.$[j].pourcentage": pourcentage
                }
            },
            {
                arrayFilters: [{ "i.tache._id": req.params.idTache }, { "j._id": req.params.idTache }],
                new: true
            }
        );
        if (!projet) {
            return res.status(404).json({ msg: "Projet not found" });
        }
        if (!tache) {
            return res.status(404).json({ msg: "Tache not found" });
        }
        res.json(projet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


// const updateTache = async (req, res) => {
//     try {
//         const { name, timeslot, pourcentage } = req.body;
//         const projet = await Projet.findOneAndUpdate(
//             {
//                 "_id": req.params.idProjet,
//                 "axes._id": req.params.idAxe,
//                 "axes.tache._id": req.params.idTache
//             },
//             {
//                 $set: {
//                     "axes.$[i].tache.$[j].name": name,
//                     "axes.$[i].tache.$[j].timeslot": timeslot,
//                     "axes.$[i].tache.$[j].pourcentage": pourcentage
//                 }
//             },
//             {
//                 arrayFilters: [
//                     { "i._id": req.params.idAxe },
//                     { "j._id": req.params.idTache }
//                 ],
//                 new: true
//             }
//         );
//         if (!projet) {
//             return res.status(404).json({ msg: "Projet not found" });
//         }
//         res.json(projet);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server Error");
//     }
// };

const userStat = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'ADMIN' });
        const technicienCount = await User.countDocuments({ role: 'TECHNICIEN' });
        const ingenieurCount = await User.countDocuments({ role: 'INGENIEUR' });
        const totalCount = adminCount + technicienCount + ingenieurCount;
        res.json({
            status: true,
            result: {
                adminCount,
                technicienCount,
                ingenieurCount,
                totalCount,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
        });
    }
}
const imagePofile = async (req, res) => {
    console.log("req.files", req.file)
    try {
        console.log(req.user, req.body)
        const user = await User.findById(req.user.id);
        // const { cin, specialite } = req.body
        // const cv = req.file.cv || ''
        // const image = req.file.image || gravatar.url(email, { s: '200', r: 'pg', d: '404' })
        if (user) {
            const result = await User.findByIdAndUpdate(req.user.id, { $set: { avatar: req.file.filename } })
                .select('-password')
            res.json({
                status: true,
                result: result
            })
        } else {
            res.status(404).json({
                succes: false,
                msg: 'user not found'
            })
        }
    } catch (error) {
        console.log("update profile", error)
    }
}
const saveCv = async (req, res) => {
    console.log("req.files", req.file)
    try {
        console.log(req.user, req.body)
        const user = await User.findById(req.user.id);
        // const { cin, specialite } = req.body
        // const cv = req.file.cv || ''
        // const image = req.file.image || gravatar.url(email, { s: '200', r: 'pg', d: '404' })
        if (user) {
            const result = await User.findByIdAndUpdate(req.user.id, { $set: { cv: req.file.filename } })
                .select('-password')
            res.json({
                status: true,
                result: result
            })
        } else {
            res.status(404).json({
                succes: false,
                msg: 'user not found'
            })
        }
    } catch (error) {
        console.log("update profile", error)
    }
}
const contrat = async (req, res) => {
    console.log("req.files", req.file)
    try {
        console.log(req.projet, req.body)
        res.send({ result: 'http://localhost:3000/contrat/' + req.file.filename })
        // if (projet) {
        //     const result = await Projet.findByIdAndUpdate(req.projet.id, { $set: { contrat: req.file.filename } })
        //     res.json({
        //         status: true,
        //         result: result
        //     })
        // } else {
        //     res.status(404).json({
        //         succes: false,
        //         msg: 'contrat not found'
        //     })
        // }
    } catch (error) {
        console.log("update contrat", error)
    }
}
function logout(req, res) {
    req.logout(); // This line logs out the current user
    res.redirect('/'); // Redirect the user to the homepage
}
const ajoutProjet = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ errors: errors.array({ onlyFirstError: true }) })
    }
    const { nom_projet, client, description, short_description, begin, end, user, code_postal, contrat } = req.body
    try {
        // else define new Projet
        const newProjet = new Projet({
            nom_projet, client, description, short_description, begin, end, user, code_postal, contrat,
        })
        // save new projet
        await newProjet.save()
        res.status(200).send({ status: true })
    } catch (error) {
        console.error('erreur', error)
        res.status(400).send({ status: false })
    }
}
const ajouterAxe = async (req, res) => {
    const { id_projet, name } = req.body;
    const id_axe = new ObjectId(); // Génère un nouvel ObjectID pour l'axe
    try {
        // Récupérer le projet à mettre à jour
        const projet = await Projet.findById(id_projet);
        if (!projet) {
            return res.status(404).send({ message: "Projet introuvable" });
        }
        // Ajouter le nouvel axe au document du projet
        projet.axes.push({
            _id: id_axe,
            name: name,
        });
        // Sauvegarder les modifications
        await projet.save();
        res.status(200).send({ status: true, message: "Axe ajouté avec succès" });
    } catch (error) {
        console.error('erreur', error)
        res.status(400).send({ status: false, message: "Erreur lors de l'ajout de l'axe" });
    }
};
const ajouterTache = async (req, res) => {
    const { id_axe, name, timeslot, pourcentage } = req.body;
    const id_tache = new mongoose.Types.ObjectId();
    try {
        // Récupérer le projet à mettre à jour
        const projet = await Projet.findOne({ "axes._id": id_axe });
        if (!projet) {
            return res.status(404).send({ message: "Projet introuvable" });
        }
        // Trouver l'axe dans le tableau axes du projet
        const axe = projet.axes.find(axe => axe._id.toString() === id_axe);
        if (!axe) {
            return res.status(404).send({ message: "Axe introuvable dans le projet" });
        }
        // Vérifier que l'axe a un tableau tache avant d'ajouter la nouvelle tâche
        if (!axe.tache) {
            axe.tache = [];
        }
        // Ajouter la nouvelle tâche à l'axe en créant un nouvel objet de tâche
        const nouvelleTache = {
            _id: id_tache,
            name: name, // Utiliser la valeur de name provenant de req.body pour définir le nom de la tâche
            timeslot: timeslot, // Utiliser la valeur de timeslot provenant de req.body pour définir le temps alloué à la tâche
            pourcentage: pourcentage, // Utiliser la valeur de pourcentage provenant de req.body pour définir le pourcentage de progression de la tâche
        };
        console.log('nouvelle', nouvelleTache);
        axe.tache.push(nouvelleTache);
        // Sauvegarder les modifications du projet

        await projet.save();
        console.log("proj", projet);
        res.status(200).send({ status: true, message: "Tâche ajoutée avec succès à l'axe" });
    } catch (error) {
        console.error('Erreur', error)
        res.status(400).send({ status: false, message: "Erreur lors de l'ajout de la tâche à l'axe" });
    }
};

//     const { id_axe, name, timeslot, pourcentage } = req.body;
//     const id_tache = new mongoose.Types.ObjectId();
//     try {
//         // Récupérer le projet à mettre à jour
//         const projet = await Projet.findOne({ "axes._id": id_axe });
//         if (!projet) {
//             return res.status(404).send({ message: "Projet introuvable" });
//         }
//         // Trouver l'axe dans le tableau axes du projet
//         const axe = projet.axes.find(axe => axe._id.toString() === id_axe);
//         if (!axe) {
//             return res.status(404).send({ message: "Axe introuvable dans le projet" });
//         }
//         // Vérifier que l'axe a un tableau tache avant d'ajouter la nouvelle tâche
//         if (!axe.tache) {
//             axe.tache = [];
//         }
//         // Ajouter la nouvelle tâche à l'axe en créant un nouvel objet de tâche
//         const nouvelleTache = {
//             _id: id_tache,
//             name: name, // Utiliser la valeur de name provenant de req.body pour définir le nom de la tâche
//             timeslot: timeslot, // Utiliser la valeur de name provenant de req.body pour définir le nom de la tâche
//             pourcentage: pourcentage, // Utiliser la valeur de name provenant de req.body pour définir le nom de la tâche
//         };
//         axe.tache.push(nouvelleTache);
//         // Sauvegarder les modifications du projet
//         await projet.save();
//         res.status(200).send({ status: true, message: "Tâche ajoutée avec succès à l'axe" });
//     } catch (error) {
//         console.error('Erreur', error)
//         res.status(400).send({ status: false, message: "Erreur lors de l'ajout de la tâche à l'axe" });
//     }
// };
const getAxes = async (req, res) => {
    try {
        const axes = await Projet.distinct('axes'); // Utiliser distinct pour récupérer uniquement les _id des axes
        res.status(200).send(axes);
    } catch (error) {
        console.error('Erreur', error);
        res.status(500).send({ message: "Erreur lors de la récupération des axes" });
    }
}

const countUsersByRole = async () => {
    try {
        const roles = ['ADMIN', 'TECHNICIEN', 'INGENIEUR'];
        const counts = {};
        for (const role of roles) {
            const count = await User.countDocuments({ role });
            counts[role] = count;
        }
        console.log('Nombre d\'utilisateurs par rôle :', counts);
    } catch (error) {
        console.error('Erreur lors du comptage des utilisateurs :', error);
    }
};
const searchProjet = async (searchTerm) => {

    const regex = new RegExp('^' + searchTerm, 'i');
    const result = await Projet.findOne({
        $or: [
            { nom_projet: regex },
            { client: regex },
            { description: regex },
            { short_description: regex },
            { begin: regex },
            { end: regex },
            { user: regex },
            { code_postal: regex },
            { contrat: regex },
            { 'axes.name': regex },
        ],
    });
    return result;
};

module.exports = {
    saveCv,
    imagePofile,
    registerUser,
    getUser,
    loginUser,
    sendForgetPasswordEmail,
    updatePassword,
    getUserPofile,
    editUserPofile,
    contrat,
    ajoutProjet,
    getProjet,
    countUsersByRole,
    getIdProjet,
    userStat,
    updateProjet,
    ajouterAxe,
    searchProjet,
    ajouterTache,
    getAxes,
    updateTache
}