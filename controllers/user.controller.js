const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model');
const Projet = require('../models/projet.model');
const mongoose = require('mongoose');
const { generateToken, verifToken } = require('../utils/generateToken');
require("dotenv").config();
const mailer = require('../utils/sendPasswordRecoveryMail');
const mailUser = require('../utils/sendMailPasswordUser');
const { config } = require('dotenv');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { Role } = require('../models/role.model');
const { Document } = require('../models/document.model');



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
            console.log(email);
            //  Envoyer l'e-mail à l'utilisateur
            mailUser.sendEmailToUser(email, password)

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
        res.send({ status: true, message: 'passorw updated successfully' })
    } catch (error) {
        console.log(error)
    }
}
//***********get user */
const editUserPofile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
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
        const projet = await Projet.findOneAndUpdate({ _id: req.params.idProjet }, { $set: req.body }, { new: true });
        res.json(projet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const imagePofile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
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
    try {
        const user = await User.findById(req.user.id);
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
    try {
        res.send({ result: 'http://localhost:3000/contrat/' + req.file.filename })
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
        axe.tache.push(nouvelleTache);
        // Sauvegarder les modifications du projet

        await projet.save();
        res.status(200).send({ status: true, message: "Tâche ajoutée avec succès à l'axe" });
    } catch (error) {
        console.error('Erreur', error)
        res.status(400).send({ status: false, message: "Erreur lors de l'ajout de la tâche à l'axe" });
    }
}


const getAxes = async (req, res) => {
    try {
        const axes = await Projet.distinct('axes'); // Utiliser distinct pour récupérer uniquement les _id des axes
        res.status(200).send(axes);
    } catch (error) {
        console.error('Erreur', error);
        res.status(500).send({ message: "Erreur lors de la récupération des axes" });
    }
}
const calculateTaskPercentages = async (req, res) => {
    try {
        const projects = await Projet.find();
        // Calculate task percentages and averages for each project
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const axes = project.axes;
            let totalPourcentage = 0;
            axes.forEach(axis => {
                let axisTotalPourcentage = 0;
                let taskCount = axis.tache.length;
                axis.tache.forEach(tache => {
                    axisTotalPourcentage += tache.pourcentage;
                });
                const meanPourcentageTaches = taskCount > 0 ? axisTotalPourcentage / taskCount : 0;
                axis.mean_pourcentage_taches = meanPourcentageTaches;
                totalPourcentage += meanPourcentageTaches;
            });
            const meanPourcentageAxes = axes.length > 0 ? totalPourcentage / axes.length : 0;
            project.mean_pourcentage_axes = meanPourcentageAxes;
            // Save the updated project
            console.log("pro", project.mean_pourcentage_axes);
            await project.save();
        }

        return res.status(200).json({ result: projects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const calculateUserStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: await Role.findOne({ name: 'Admin' }) });
        const engineerCount = await User.countDocuments({ role: await Role.findOne({ name: 'ingenieur' }) });
        const technicianCount = await User.countDocuments({ role: await Role.findOne({ name: 'technicien' }) });

        res.json({
            totalUsers,
            adminCount,
            engineerCount,
            technicianCount
        });
    } catch (error) {
        console.error('Error calculating user statistics:', error);
        res.status(500).json({ error: 'An error occurred while calculating user statistics' });
    }
};
const searchProjet = async (searchTerm) => {
    try {
        const regex = new RegExp(searchTerm, 'gi');
        const projet = await Projet.find({
            $or: [
                { nom_projet: regex },
                { client: regex },
                { short_description: regex },
                { begin: regex },
                { end: regex },
                { user: regex },
                { code_postal: regex },
            ],
        });
        if (projet) {
            return projet;
        } else {
            return null;
        }
    } catch (err) {
        throw new Error(err);
    }
};
const getMyDoc = async (req, res) => {
    try {
        const parent = req.params.parentId ==0?null:req.params.parentId
        const docs = await Document.find({user:req.user.id,parent:parent });
        if (docs) {
            return res.json({
                status: true,
                data: docs
            })
        }
        else {
            res.status(404).send({
                status: false,
                msg: 'docs not found'
            })
        }
    } catch (error) {
        console.log("update profile", error)
    }
}
const newDoc = async (req, res) => {
    try {
        req.body.user = req.user.id
        req.body.parent=req.params.parentId==0?null   :req.params.parentId
        const docs = new Document(req.body);
        let result = await docs.save()
            return res.json({
                status: true,
                data: result
            })
    
        
    } catch (error) {
        console.log("update profile", error)
    }
}
const newFile = async (req, res) => {
    try {
        console.log(req.file)
       
      if(req.file){
        let arr = req.file.originalname.split('.');
        req.body.type= arr[arr.length-1].toUpperCase();
        req.body.size=req.file.size;
        req.body.path=req.file.filename;
       return res.send(req.body)
      }
    
        
    } catch (error) {
        console.log("update profile", error)
    }
}
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
    calculateUserStatistics,
    getIdProjet,
    updateProjet,
    ajouterAxe,
    searchProjet,
    ajouterTache,
    getAxes,
    updateTache,
    calculateTaskPercentages,
    getMyDoc, newDoc ,newFile

}