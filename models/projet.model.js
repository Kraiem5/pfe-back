const mongoose = require('mongoose')
require("dotenv").config();

const userSchema = new mongoose.Schema({
    nom_projet: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    short_description: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    begin: {
        type: String,

    },
    end: {
        type: String,

    },
    user: {
        type: String,
    }
    ,
    code_postal: {
        type: String,
    }
    ,
    contrat: {
        type: String,
    },
    mean_pourcentage_axes: {
        type: String,
    },
    axes: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            default: mongoose.Types.ObjectId
        },
        name: {
            type: String,
            required: true
        },
        mean_pourcentage_taches: {
            type: String,
        },
        tache: [{
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
                default: mongoose.Types.ObjectId

            },
            name: {
                type: String,
                required: true
            },
            timeslot: {
                type: String,


            },
            pourcentage: {
                type: String,

            },
        }]
    }],



}, { timestamps: true }
)


module.exports = Projet = mongoose.model('projet', userSchema)